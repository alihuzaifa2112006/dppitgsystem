import * as Yup from 'yup';
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
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';

import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFCheckbox, RHFTextField } from 'src/components/hook-form';

import { Get, Post } from 'src/api/apibasemethods';
import AutocompleteWithAdd from 'src/components/AutocompleteWithAdd';
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function ColorCreateForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Date In SQL format
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const [isLoading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [allColorFamily, setAllColorFamily] = useState([]);
  const [allColors, setallColors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [shadeTypes, setShadeTypes] = useState([]);

  const FetchColorData = useCallback(async () => {
    try {
      const response = await Get(
        `colors/all?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      const newdata = response.data.Data.map((item) => ({
        ...item,
        ColorNickName: `${item.ColorName} - ${item.Color_Code}`,
      }));
      setTableData(newdata);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const FetchColorFamily = useCallback(async () => {
    try {
      const response = await Get(
        `GetColorFamilies?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      setAllColorFamily(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllWICList?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      setCustomers(response.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const fetchShadeTypes = useCallback(async () => {
    try {
      const response = await Get(
        `ColorTypes/Getall?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      setShadeTypes(response.data || []);
    } catch (error) {
      console.error('Error fetching shade types:', error);
      throw error;
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        FetchColorData(),
        FetchColorFamily(),
        fetchCustomers(),
        fetchShadeTypes(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [FetchColorData, FetchColorFamily, fetchCustomers, fetchShadeTypes]);
  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewColorSchema = Yup.object().shape({
    // SL: Yup.number().required('SL No. is required'),
    ColorFamily: Yup.object().required('Color Family is required'),
    ColorName: Yup.mixed().when('isMultiColor', {
      is: false,
      then: () =>
        Yup.mixed()
          .test('string', 'Color Name is required', (value) => value)
          .required('Color Name is required'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    Color_Code: Yup.mixed().when('isMultiColor', {
      is: false,
      then: () =>
        Yup.mixed()
          .test('string', 'Color Code is required', (value) => value)
          .required('Color Code is required'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    ShadeType: Yup.mixed().when('isMultiColor', {
      is: false,
      then: () => Yup.mixed().required('Shade Type is required'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    Customer: Yup.mixed().when('ShadeType', {
      is: (ShadeType) => ShadeType?.TypeID === 2,
      then: () => Yup.mixed().required('Customer is required'),
      otherwise: () => Yup.mixed().notRequired(),
    }),

    DataColorAndCode: Yup.string().when('isMultiColor', {
      is: false,
      then: () => Yup.string().required('Data Color is required'),
      otherwise: () => Yup.string().notRequired(),
    }),
    // HexCode: Yup.string().when('isMultiColor', {
    //   is: false,
    //   then: () =>
    //     Yup.mixed()
    //       .test('string', 'Hex Code is required', (value) => value)
    //       .required('Hex Code is required'),
    //   otherwise: () => Yup.mixed().notRequired(),
    // }),
    colorMap: Yup.array().when('isMultiColor', {
      is: true,
      then: () =>
        Yup.array().of(
          Yup.object().shape({
            ColorReference: Yup.object().required('Color Name is required'),
            // Color_Code: Yup.string().required('Color Code is required'),
            // HexCode: Yup.string().required('Hex Code is required'),
            // ShadeType: Yup.object().required('Shade Type is required'),
            // Customer: Yup.object().required('Customer is required'),
            // DataColorAndCode: Yup.string().required('Data Color is required'),
          })
        ),
    }),
  });

  const methods = useForm({
    resolver: yupResolver(NewColorSchema),
    defaultValues: {
      isMultiColor: false,
      HexCode: '',
      colorMap: [
        {
          ColorReference: null,
          // Color_Code: '',
          HexCode: '',
        },
        {
          ColorReference: null,
          // Color_Code: '',
          HexCode: '',
        },
      ],
    },
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

  const GetColors = useCallback(async () => {
    try {
      const response = await Get(
        `colors/all?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      const newdata = response.data.Data.filter((x) => x.SL !== '1').map((item) => ({
        ...item,
        ColorNickName: `${item.ColorName} - ${item.Color_Code}`,
      }));

      // const filteredData = newdata.filter(
      //   (item) => item.ColorFamilyID === values?.ColorFamily?.ColorFamilyID
      // );
      setallColors(newdata);
    } catch (error) {
      console.log(error);
      setallColors([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    GetColors();
  }, [GetColors]);

  useEffect(() => {
    const generateColorNickName = () => {
      const nickname = `${values?.ColorName} - ${values?.Color_Code}`;
      setValue('ColorNickName', nickname || '');
    };
    if (values.ColorName && values.Color_Code) {
      generateColorNickName();
    }
  }, [values.ColorName, values.Color_Code, setValue]);

  useEffect(() => {
    const generateMuiltiColorNickName = (colorMap) => {
      const nickname = colorMap
        .map(
          (color) =>
            `${color?.ColorReference?.ColorName || ''} - ${color?.ColorReference?.Color_Code || ''}`
        )
        .join(' + ');
      setValue('ColorNickName', nickname || '');
    };
    if (values?.isMultiColor) {
      generateMuiltiColorNickName(values.colorMap);
    }
    // eslint-disable-next-line
  }, [
    values.isMultiColor,
    // eslint-disable-next-line
    ...(values.colorMap || []).flatMap((color, index) => [
      values.colorMap?.[index]?.ColorReference,
      // values.colorMap?.[index]?.ColorReference.Color_Code,
    ]),
    setValue,
  ]);

  // ------------------------------------
  const handleAddFamily = async (newOption) => {
    if (newOption === '') {
      enqueueSnackbar('Please Enter Color Family', { variant: 'error' });
      return;
    }
    // check after trimming and lowercase
    const newOptionTrimmed = newOption.trim().toLowerCase();
    // check if the option already exists
    if (
      allColorFamily.find(
        (option) => option.ColorFamilyName.trim().toLowerCase() === newOptionTrimmed
      )
    ) {
      enqueueSnackbar('This Color Family already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        ColorFamilyName: newOption,
        Description: 'N/A',
        isActive: true,
        isDeleted: false,
        CreatedBy: userData?.userDetails?.userId,
        UpdatedBy: userData?.userDetails?.userId,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
      };

      await Post('AddColorFamily', dataToSend);
      FetchColorFamily();
      enqueueSnackbar('Color Family Added Successfully', { variant: 'success' });
    } catch (error) {
      console.log('Error', error);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    // check if the color already exists in tableData after trimming and converting to lowercase
    const existingColor = tableData.find(
      (color) =>
        color.ColorNameandCode.trim().toLowerCase() === data?.NomanClature?.trim().toLowerCase()
      // color.Color_Code.trim().toLowerCase() === data?.Color_Code?.trim().toLowerCase()
    );
    if (existingColor) {
      enqueueSnackbar('Color already exists', { variant: 'error' });
      return;
    }
    const combinedColorName = data?.isMultiColor
      ? data.colorMap.map((color) => color?.ColorReference?.ColorName).join(' + ')
      : data?.ColorName;
    const combinedColorCode = data?.isMultiColor
      ? data.colorMap.map((color) => color?.ColorReference?.Color_Code).join(' + ')
      : data?.Color_Code;
    const combinedHexCode = data?.isMultiColor
      ? data.colorMap.map((color) => color?.ColorReference?.HexCode.trim()).join(' + ')
      : data?.HexCode?.trim();

    const dataToSend = {
      SL: data?.isMultiColor ? 1 : 0,
      isMultiColor: data?.isMultiColor,
      ColorFamilyID: data?.ColorFamily?.ColorFamilyID,
      ColorName: data?.isMultiColor ? combinedColorName : data.ColorName,
      Color_Code: data?.isMultiColor ? combinedColorCode : data.Color_Code,
      NomanClature: data.ColorNickName,
      HexCode: data?.isMultiColor ? combinedHexCode : data?.HexCode?.trim(),
      CustomerID: data?.Customer?.WIC_ID || 0,
      TypeID: data?.ShadeType?.TypeID || 0,
      DataColorAndCode: data?.DataColorAndCode?.trim() || '',
      Details: data?.isMultiColor
        ? data?.colorMap.map((detail) => ({
            ColorName: detail.ColorReference?.ColorName,
            Color_Code: detail.ColorReference?.Color_Code,
            HexCode: detail.ColorReference?.HexCode.trim(),
            ColorRefID: detail.ColorReference?.ColorID,
            // CustomerID: detail.Customer?.WIC_ID,
            // ShadeType: detail.ShadeType?.ShadeTypeName,
            // DataColorAndCode: detail.DataColorAndCode?.DataColorName,
            IsActive: true,
          }))
        : [],
      CreatedBy: userData.userDetails.userId,
      UpdatedBy: userData.userDetails.userId,
      IsActive: true,
      Branch_ID: userData.userDetails.branchID,
      Org_ID: userData.userDetails.orgId,
    };
    console.log(dataToSend);
    try {
      await Post(
        `color/add?branchID=${userData?.userDetails?.branchID}&orgID=${userData?.userDetails?.orgId}`,
        dataToSend
      ).then(async (res) => {
        if (res.data.Success === false) {
          enqueueSnackbar(res.data.Message, { variant: 'error' });
        } else {
          enqueueSnackbar('Created Successfully!');
          router.push(paths.dashboard.productManagement.colorDatabase.root);
          reset();
        }
      });
    } catch (error) {
      console.error(error);
    }
  });

  // handleAdd
  const handleAdd = () => {
    const newColor = {
      ColorName: '',
      Color_Code: '',
      HexCode: '',
    };
    setValue('colorMap', [...values.colorMap, newColor]);
  };

  // handleColorDelete

  const handleColorDelete = (selectedcolor) => {
    if (values.colorMap.length === 2) {
      enqueueSnackbar('Please select atleast 2 colors.', { variant: 'error' });
      return;
    }
    const updatedColors = values.colorMap.filter((clr) => clr !== selectedcolor);
    setValue('colorMap', updatedColors);
  };

  const renderLoading = (
    <LoadingScreen
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '70vh',
      }}
    />
  );

  return isLoading ? (
    renderLoading
  ) : (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <h3>Color Details:</h3>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              {/* <RHFTextField name="SL" label="SL No." type="number" /> */}
              <Box sx={{ gridColumn: { sm: 'span 2' } }}>
                <RHFCheckbox name="isMultiColor" label="Multi Color" />
              </Box>

              <AutocompleteWithAdd
                name="ColorFamily"
                label="Color Family"
                options={allColorFamily}
                getOptionLabel={(option) => option?.ColorFamilyName || ''}
                isOptionEqualToValue={(option, value) =>
                  option?.ColorFamilyID === value?.ColorFamilyID
                }
                value={values?.ColorFamily || null}
                onAdd={handleAddFamily}
              />
              <RHFAutocomplete
                name="ShadeType"
                label="Shade Type"
                placeholder="Choose an option"
                fullWidth
                options={shadeTypes}
                getOptionLabel={(option) => option.TypeName}
                isOptionEqualToValue={(option, value) => option.TypeID === value.TypeID}
                value={values?.ShadeType || null}
              />

              {values?.ShadeType?.TypeID === 2 && (
                <RHFAutocomplete
                  name="Customer"
                  label="Customer"
                  placeholder="Choose an option"
                  fullWidth
                  options={customers}
                  getOptionLabel={(option) => option.WIC_Name}
                  isOptionEqualToValue={(option, value) => option.WIC_ID === value.WIC_ID}
                  value={values?.Customer || null}
                />
              )}
              {values?.isMultiColor ? (
                <>
                  <Box sx={{ gridColumn: { sm: 'span 2' } }}>
                    <TableContainer component={Paper}>
                      <Scrollbar>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ minWidth: 250 }}>Color Name & Code</TableCell>
                              {/* <TableCell sx={{ minWidth: 180 }}>Color Code</TableCell> */}
                              <TableCell sx={{ minWidth: 250 }}>RGB Code</TableCell>
                              <TableCell sx={{ minWidth: 250 }}>Shade Type</TableCell>
                              <TableCell sx={{ minWidth: 250 }}>Data Color & Code</TableCell>
                              <TableCell sx={{ minWidth: 250 }}>Customer</TableCell>
                              <TableCell align="center">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {values?.colorMap?.map((clr, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  {/* <RHFTextField
                                    name={`colorMap[${index}].ColorName`}
                                    label="Color Name"
                                    size="small"
                                  /> */}
                                  <RHFAutocomplete
                                    name={`colorMap[${index}].ColorReference`}
                                    // label="Color Name & Code"
                                    placeholder="Choose an option"
                                    fullWidth
                                    options={allColors}
                                    getOptionLabel={(option) => option?.ColorNickName}
                                    isOptionEqualToValue={(option, value) =>
                                      option.ColorID === value?.ColorID
                                    }
                                    value={values?.colorMap[index].ColorReference || null}
                                  />
                                </TableCell>
                                {/* <TableCell>
                                  <RHFTextField
                                    name={`colorMap[${index}].Color_Code`}
                                    label="Color Code"
                                    // size="small"
                                  />
                                </TableCell> */}
                                <TableCell>
                                  <RHFTextField
                                    name={`colorMap[${index}].HexCode`}
                                    // label="Hex Code / Score"
                                    disabled
                                    placeholder="-"
                                    value={
                                      values?.colorMap[index]?.ColorReference?.HexCode.trim() || ''
                                    }
                                    // size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <RHFTextField
                                    name={`colorMap[${index}].ShadeType`}
                                    disabled
                                    placeholder="-"
                                    value={values?.colorMap[index].ColorReference?.TypeName || ''}
                                    // size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <RHFTextField
                                    name={`colorMap[${index}].DataColorAndCode`}
                                    disabled
                                    placeholder="-"
                                    value={
                                      values?.colorMap[index]?.DataColorAndCode?.trim() ||
                                      values?.colorMap[index]?.ColorReference?.DataColorAndCode?.trim() ||
                                      ''
                                    }
                                    // size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <RHFTextField
                                    name={`colorMap[${index}].Customer`}
                                    disabled
                                    placeholder="-"
                                    value={
                                      values?.colorMap[index].ColorReference?.CustomerName || ''
                                    }
                                    // size="small"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton onClick={() => handleColorDelete(clr)} color="error">
                                    <Iconify icon="solar:trash-bin-trash-bold" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Scrollbar>
                    </TableContainer>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                      <Button variant="contained" color="primary" onClick={handleAdd}>
                        Add More
                      </Button>
                    </Box>
                  </Box>
                </>
              ) : (
                <>
                  <RHFTextField name="ColorName" label="Color Name" />
                  <RHFTextField name="Color_Code" label="Color Code" />
                  <RHFTextField name="HexCode" label="RGB Code" placeholder="#000000" />
                </>
              )}
              <RHFTextField
                name="DataColorAndCode"
                label="Data Color & Code"
                placeholder="Data Color & Code"
              />
              <RHFTextField
                name="ColorNickName"
                label="Color Nick Name"
                disabled
                InputLabelProps={{ shrink: true }}
              />
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
