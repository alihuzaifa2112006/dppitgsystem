const fs = require('fs');
const path = require('path');

const entities = [
  { name: 'Office', route: 'offices', title: 'Offices' },
  { name: 'Factory', route: 'factories', title: 'Factories' },
  { name: 'TransactionType', route: 'transaction-types', title: 'Transaction Types' },
  { name: 'PaymentTerm', route: 'payment-terms', title: 'Payment Terms' },
  { name: 'PaymentMode', route: 'payment-modes', title: 'Payment Modes' },
  { name: 'Incoterm', route: 'incoterms', title: 'Incoterms' },
  { name: 'TransportMode', route: 'transport-modes', title: 'Transport Modes' },
  { name: 'Composition', route: 'composition', title: 'Composition' },
  { name: 'BuyingDepartment', route: 'buying-departments', title: 'Buying Departments' }
];

const sectionsBase = path.join(__dirname, 'src/sections/Powertool');
const pagesBase = path.join(__dirname, 'src/pages/dashboard/Powertool');

fs.mkdirSync(sectionsBase, { recursive: true });
fs.mkdirSync(pagesBase, { recursive: true });

entities.forEach(ent => {
  const sectionDir = path.join(sectionsBase, ent.name);
  const pageDir = path.join(pagesBase, ent.name);
  
  fs.mkdirSync(sectionDir, { recursive: true });
  fs.mkdirSync(pageDir, { recursive: true });

  // 1. list.jsx
  const listPageCode = `import { Helmet } from 'react-helmet-async';
import ${ent.name}List from 'src/sections/Powertool/${ent.name}/${ent.name}-list';

export default function ${ent.name}ListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: ${ent.title} List</title>
      </Helmet>
      <${ent.name}List />
    </>
  );
}`;
  fs.writeFileSync(path.join(pageDir, 'list.jsx'), listPageCode);

  // 2. new.jsx
  const newPageCode = `import { Helmet } from 'react-helmet-async';
import ${ent.name}Form from 'src/sections/Powertool/${ent.name}/${ent.name}-form';

export default function ${ent.name}NewPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new ${ent.name}</title>
      </Helmet>
      <${ent.name}Form />
    </>
  );
}`;
  fs.writeFileSync(path.join(pageDir, 'new.jsx'), newPageCode);

  // 3. edit.jsx
  const editPageCode = `import { Helmet } from 'react-helmet-async';
import ${ent.name}EditForm from 'src/sections/Powertool/${ent.name}/${ent.name}-edit-form';

export default function ${ent.name}EditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Edit ${ent.name}</title>
      </Helmet>
      <${ent.name}EditForm />
    </>
  );
}`;
  fs.writeFileSync(path.join(pageDir, 'edit.jsx'), editPageCode);

  // 4. Section List Component
  const listCompCode = `import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

export default function ${ent.name}List() {
  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">${ent.title}</Typography>
        <Button component={RouterLink} href={paths.dashboard.Powertool.${ent.name}.new} variant="contained">
          New ${ent.name}
        </Button>
      </Stack>
      <Typography>List of ${ent.title} will appear here.</Typography>
    </Box>
  );
}`;
  fs.writeFileSync(path.join(sectionDir, `${ent.name}-list.jsx`), listCompCode);

  // 5. Section Form Component
  const formCompCode = `import React from 'react';
import { Box, Typography, TextField, Button, Grid, Stack } from '@mui/material';

export default function ${ent.name}Form() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={3}>Create New ${ent.name}</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Field 1" />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Field 2" />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Field 3" />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Field 4" />
        </Grid>
      </Grid>
      <Stack direction="row" mt={3}>
        <Button variant="contained">Save</Button>
      </Stack>
    </Box>
  );
}`;
  fs.writeFileSync(path.join(sectionDir, `${ent.name}-form.jsx`), formCompCode);

  // 6. Section Edit Form Component
  const editFormCompCode = `import React from 'react';
import { Box, Typography, TextField, Button, Grid, Stack } from '@mui/material';

export default function ${ent.name}EditForm() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={3}>Edit ${ent.name}</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Field 1" defaultValue="Sample Data 1" />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Field 2" defaultValue="Sample Data 2" />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Field 3" defaultValue="Sample Data 3" />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Field 4" defaultValue="Sample Data 4" />
        </Grid>
      </Grid>
      <Stack direction="row" mt={3}>
        <Button variant="contained">Update</Button>
      </Stack>
    </Box>
  );
}`;
  fs.writeFileSync(path.join(sectionDir, `${ent.name}-edit-form.jsx`), editFormCompCode);

});
console.log('Scaffolding complete.');
