import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  Checkbox,
  Chip,
  IconButton,
  InputAdornment,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';

import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';

import { Get, Post, Put } from 'src/api/apibasemethods';
import Scrollbar from 'src/components/scrollbar';
import { set } from 'lodash';
import { id } from 'date-fns/locale';
import QASignDialog from 'src/components/QASignDialog';
import { SingleFilePreview } from 'src/components/upload';

// ----------------------------------------------------------------------

export default function ApprovalEditForm({ currentApproval }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [isLoading, setLoading] = useState(false);
  const [totalRatio, setTotalRatio] = useState(0);
  const [blendType, setBlendType] = useState([]);
  const [blendName, setBlendName] = useState([]);
  const [detailRow, setDetailRow] = useState([]);
  const [approvalName, setApprovalName] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);

  // Function to group approvers by their level
  const groupApproversByLevel = (approvers) =>
    approvers.reduce((acc, approver) => {
      const level = approver.Approval_LvlID;
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push({
        UserID: approver.ApproverID,
        fullName: approver.Username,
        Designation: approver.Designation,
        Dpt_Name: approver.Dpt_Name,
      });
      return acc;
    }, {});

  // Default values for the form
  const defaultValues = useMemo(() => {
    if (!currentApproval)
      return {
        documents: null,
        Admins: [],
        KAM: [],
        TopAuthority: [],
      };

    const groupedApprovers = groupApproversByLevel(currentApproval);

    return {
      documents: {
        Doc_ID: currentApproval[0]?.Doc_ID,
        Doc_Name: currentApproval[0]?.Doc_Name,
      },
      Admins: groupedApprovers[1] || [], // 1st level approvers
      KAM: groupedApprovers[2] || [], // 2nd level approvers
      TopAuthority: groupedApprovers[3] || [], // 3rd level approvers
    };
  }, [currentApproval]);

  const NewApprovalSchema = Yup.object().shape({
    documents: Yup.object()
      .shape({
        Doc_ID: Yup.number().required(),
      })
      .required('Document is required')
      .nullable(),
  });

  const methods = useForm({
    resolver: yupResolver(NewApprovalSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (currentApproval) {
      reset(defaultValues);
    }
  }, [currentApproval, defaultValues, reset]);

  const [documentType, setDocumentType] = useState([]);
  const [approvers, setApprovers] = useState([]);
  const [levels, setLevels] = useState([]);
  const [signQA, setSignQA] = useState(null);
  const [approverSignatures, setApproverSignatures] = useState({});

  // Signature Pad Functions
  const [signPadOpen, setSignPadOpen] = useState(false);
  const [signPadData, setSignPadData] = useState();
  const [currentApprover, setCurrentApprover] = useState(null);
  const selectedAdmins = watch('Admins') || [];
  const selectedKAM = watch('KAM') || [];
  const selectedGA = watch('TopAuthority') || [];
  const combined = [...selectedAdmins, ...selectedKAM, ...selectedGA];

  const getFilteredOptions = (excludeList) => {
    const excludeIds = excludeList.map((a) => a?.UserID);
    return approvers.filter((user) => !excludeIds.includes(user.UserID));
  };

  const dataUrlToBlob = (dataUrl) => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    // eslint-disable-next-line
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleSignPadOpen = (approver) => {
    setCurrentApprover(approver);
    setSignPadOpen(true);
  };

  const handleSignPadClose = () => {
    setSignPadOpen(false);
    setCurrentApprover(null);
  };

  const handleSaveSignature = () => {
    const dataUrl = signPadData.getTrimmedCanvas().toDataURL('image/png');
    const fileName = `signature_${currentApprover.UserID}.png`;
    const fileBlob = dataUrlToBlob(dataUrl);

    const signatureData = {
      FilePath: new File([fileBlob], fileName, {
        type: fileBlob.type,
        lastModified: Date.now(),
      }),
      label: `${currentApprover.fullName} Sign`,
      fileType: 'Signature',
      preview: URL.createObjectURL(dataUrlToBlob(dataUrl)),
    };

    setApproverSignatures((prev) => ({
      ...prev,
      [currentApprover.UserID]: signatureData,
    }));

    handleSignPadClose();
  };

  const handleClearSignature = () => {
    signPadData.clear();
  };

  const handleRemoveSignature = (userId) => {
    setApproverSignatures((prev) => {
      const newSignatures = { ...prev };
      delete newSignatures[userId];
      return newSignatures;
    });
  };

  const fecthDocs = useCallback(async () => {
    const res = await Get(
      `GetDocuments?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
    );
    if (res.status === 200) {
      setDocumentType(res.data?.Documents);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const fecthApprovers = useCallback(async () => {
    const res = await Get(
      `GetAlLRegistereKAM?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
    );
    if (res.status === 200) {
      const data = res.data.Data.map((item) => ({
        ...item,
        fullName: item?.Username,
      }));
      setApprovers(data);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const fecthLevels = useCallback(async () => {
    const res = await Get(
      `GetApprovalLevels?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
    );
    if (res.status === 200) {
      setLevels(res.data?.Data);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetch = async () => {
      await Promise.all([fecthDocs(), fecthApprovers(), fecthLevels()]);
      setLoading(false);
    };
    fetch();
  }, [fecthDocs, fecthApprovers, fecthLevels]);

  const onSubmit = handleSubmit(async (data) => {
    const updatedAdmins =
      data?.Admins?.map((item) => ({
        ApproverID: item?.UserID,
        Doc_ID: data?.documents?.Doc_ID,
        Approval_LvlID: 1,
        CreatedBy: userData.userDetails.userId,
        // Signature: approverSignatures[item.UserID] || null,
      })) || [];

    const updatedKAM =
      data?.KAM?.map((item) => ({
        ApproverID: item?.UserID,
        Doc_ID: data?.documents?.Doc_ID,
        Approval_LvlID: 2,
        CreatedBy: userData.userDetails.userId,
        // Signature: approverSignatures[item.UserID] || null,
      })) || [];

    const updatedGA =
      data?.TopAuthority?.map((item) => ({
        ApproverID: item?.UserID,
        Doc_ID: data?.documents?.Doc_ID,
        Approval_LvlID: 3,
        CreatedBy: userData.userDetails.userId,
        // Signature: approverSignatures[item.UserID] || null,
      })) || [];

    const combinedApprovers = [...updatedAdmins, ...updatedKAM, ...updatedGA];

    try {
      const res = await Post('UpdateDocApprovalDetails', combinedApprovers);
      if (res?.status === 409) {
        enqueueSnackbar('Approval Already Exists', { variant: 'error' });
        return;
      }
      if (res.status === 200) {
        enqueueSnackbar('Updated Successfully!');
        router.push(paths.dashboard.admin.docApproval.root);
        reset();
      }
    } catch (error) {
      // if (error.response?.status === 409) {
      //   enqueueSnackbar('Approval Already Exists', { variant: 'error' });
      //   return;
      // }
      console.log(error);
      enqueueSnackbar('Something went wrong!', { variant: 'error' });
    }
  });

  const renderLoading = (
    <LoadingScreen
      sx={{
        borderRadius: 1.5,
        bgapproval: 'background.default',
      }}
    />
  );

  const selectedDocument = watch('documents');

  const singleApproverIds = [3, 7, 8, 9, 10, 11 ,12];
  const doubleApproverIds = [1, 4, 5, 6];
  const tripleApproverIds = [2];

  const hasSingleApprover = singleApproverIds.includes(selectedDocument?.Doc_ID);
  const hasDoubleApprover = doubleApproverIds.includes(selectedDocument?.Doc_ID);
  const hasTripleApprover = tripleApproverIds.includes(selectedDocument?.Doc_ID);

  const renderApproverSignature = (approver) => {
    const signature = approverSignatures[approver.UserID];
    return (
      <Box key={approver.UserID} sx={{ mb: 3 }}>
        <Typography variant="caption" sx={{ mb: 1 }}>
          {approver.fullName}
        </Typography>
        {signature ? (
          <>
            <Box
              sx={{
                position: 'relative',
                height: '200px',
                border: '1px dashed rgba(145, 158, 171, 0.2)',
                borderRadius: '8px',
              }}
            >
              <SingleFilePreview imgUrl={signature.preview} />
            </Box>
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'end', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => handleRemoveSignature(approver.UserID)}
              >
                Remove
              </Button>
              <Button size="small" variant="outlined" onClick={() => handleSignPadOpen(approver)}>
                Re-sign
              </Button>
            </Box>
          </>
        ) : (
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={() => handleSignPadOpen(approver)}
          >
            Add Signature
          </Button>
        )}
      </Box>
    );
  };

  return isLoading ? (
    renderLoading
  ) : (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <h3>Approval Details:</h3>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(3, 1fr)',
              }}
            >
              <RHFAutocomplete
                name="documents"
                label="Document"
                placeholder="Please Select "
                options={documentType}
                getOptionLabel={(option) => option?.Doc_Name}
                isOptionEqualToValue={(option, value) => option.Doc_ID === value.Doc_ID}
              />
              <Box />
              <Box />

              {(hasSingleApprover || hasDoubleApprover || hasTripleApprover) && (
                <RHFAutocomplete
                  name="Admins"
                  label="1st Approvers"
                  multiple
                  maxtags
                  limitTags={2}
                  options={getFilteredOptions([...selectedKAM, ...selectedGA])}
                  getOptionLabel={(option) => option?.fullName}
                  isOptionEqualToValue={(option, value) => option.UserID === value.UserID}
                  renderOption={(props, option, { selected }) => (
                    <li {...props} key={option.UserID}>
                      <Checkbox key={option.UserID} size="small" disableRipple checked={selected} />
                      {option.fullName}
                    </li>
                  )}
                  renderTags={(selected, getTagProps) =>
                    selected.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.UserID}
                        label={option.fullName}
                        size="small"
                        variant="soft"
                        color="primary"
                      />
                    ))
                  }
                />
              )}
              {(hasDoubleApprover || hasTripleApprover) && (
                <RHFAutocomplete
                  name="KAM"
                  label="2nd Approvers"
                  multiple
                  maxtags
                  limitTags={2}
                  options={getFilteredOptions([...selectedAdmins, ...selectedGA])}
                  getOptionLabel={(option) => option?.fullName}
                  isOptionEqualToValue={(option, value) => option.UserID === value.UserID}
                  renderOption={(props, option, { selected }) => (
                    <li {...props} key={option.UserID}>
                      <Checkbox
                        key={option.UserID}
                        size="small"
                        disableRipple
                        checked={selected}
                      />
                      {option.fullName}
                    </li>
                  )}
                  renderTags={(selected, getTagProps) =>
                    selected.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.UserID}
                        label={option.fullName}
                        size="small"
                        variant="soft"
                        color="primary"
                      />
                    ))
                  }
                />
              )}
              {hasTripleApprover && (
                <RHFAutocomplete
                  name="TopAuthority"
                  label="3rd Approvers"
                  multiple
                  maxtags
                  limitTags={2}
                  options={getFilteredOptions([...selectedAdmins, ...selectedKAM])}
                  getOptionLabel={(option) => option?.fullName}
                  isOptionEqualToValue={(option, value) => option.UserID === value.UserID}
                  renderOption={(props, option, { selected }) => (
                    <li {...props} key={option.UserID}>
                      <Checkbox
                        key={option.UserID}
                        size="small"
                        disableRipple
                        checked={selected}
                      />
                      {option.fullName}
                    </li>
                  )}
                  renderTags={(selected, getTagProps) =>
                    selected.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.UserID}
                        label={option.fullName}
                        size="small"
                        variant="soft"
                        color="primary"
                      />
                    ))
                  }
                />
              )}
            </Box>
          </Card>

          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
              Save
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ApprovalEditForm.propTypes = {
  currentApproval: PropTypes.array,
};
