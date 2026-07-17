const fs = require('fs');
const path = require('path');

const entities = [
  { name: 'Office', title: 'Offices', singular: 'Office' },
  { name: 'Factory', title: 'Factories', singular: 'Factory' },
  { name: 'TransactionType', title: 'Transaction Types', singular: 'Transaction Type' },
  { name: 'PaymentTerm', title: 'Payment Terms', singular: 'Payment Term' },
  { name: 'PaymentMode', title: 'Payment Modes', singular: 'Payment Mode' },
  { name: 'Incoterm', title: 'Incoterms', singular: 'Incoterm' },
  { name: 'TransportMode', title: 'Transport Modes', singular: 'Transport Mode' },
  { name: 'Composition', title: 'Composition', singular: 'Composition' },
  { name: 'BuyingDepartment', title: 'Buying Departments', singular: 'Buying Department' }
];

const sectionsBase = path.join(__dirname, 'src/sections/Powertool');

entities.forEach(ent => {
  const sectionDir = path.join(sectionsBase, ent.name);
  const formFile = path.join(sectionDir, ent.name + '-form.jsx');
  const editFile = path.join(sectionDir, ent.name + '-edit-form.jsx');

  // Generate Add Form
  const formCode = "import React from 'react';\n" +
"import { Container, Card, TextField, Button, Grid, Stack } from '@mui/material';\n" +
"import { useSettingsContext } from 'src/components/settings';\n" +
"import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';\n" +
"import { paths } from 'src/routes/paths';\n" +
"\n" +
"export default function " + ent.name + "Form() {\n" +
"  const settings = useSettingsContext();\n" +
"\n" +
"  return (\n" +
"    <Container maxWidth={settings.themeStretch ? false : 'lg'}>\n" +
"      <CustomBreadcrumbs\n" +
"        heading=\"Create a new " + ent.singular + "\"\n" +
"        links={[\n" +
"          { name: 'Home', href: paths.dashboard.root },\n" +
"          { name: '" + ent.title + " List', href: paths.dashboard.Powertool." + ent.name + ".root },\n" +
"          { name: 'New " + ent.singular + "' },\n" +
"        ]}\n" +
"        sx={{ mb: { xs: 3, md: 5 } }}\n" +
"      />\n" +
"\n" +
"      <Card sx={{ p: 3 }}>\n" +
"        <Grid container spacing={3}>\n" +
"          <Grid item xs={12} md={6}>\n" +
"            <TextField fullWidth label=\"Field 1\" />\n" +
"          </Grid>\n" +
"          <Grid item xs={12} md={6}>\n" +
"            <TextField fullWidth label=\"Field 2\" />\n" +
"          </Grid>\n" +
"          <Grid item xs={12} md={6}>\n" +
"            <TextField fullWidth label=\"Field 3\" />\n" +
"          </Grid>\n" +
"          <Grid item xs={12} md={6}>\n" +
"            <TextField fullWidth label=\"Field 4\" />\n" +
"          </Grid>\n" +
"        </Grid>\n" +
"        <Stack direction=\"row\" justifyContent=\"flex-end\" mt={3}>\n" +
"          <Button variant=\"contained\" color=\"primary\">Save</Button>\n" +
"        </Stack>\n" +
"      </Card>\n" +
"    </Container>\n" +
"  );\n" +
"}\n";

  if (fs.existsSync(formFile)) {
    fs.writeFileSync(formFile, formCode);
  }

  // Generate Edit Form
  const editCode = "import React from 'react';\n" +
"import { Container, Card, TextField, Button, Grid, Stack } from '@mui/material';\n" +
"import { useSettingsContext } from 'src/components/settings';\n" +
"import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';\n" +
"import { paths } from 'src/routes/paths';\n" +
"\n" +
"export default function " + ent.name + "EditForm() {\n" +
"  const settings = useSettingsContext();\n" +
"\n" +
"  return (\n" +
"    <Container maxWidth={settings.themeStretch ? false : 'lg'}>\n" +
"      <CustomBreadcrumbs\n" +
"        heading=\"Edit " + ent.singular + "\"\n" +
"        links={[\n" +
"          { name: 'Home', href: paths.dashboard.root },\n" +
"          { name: '" + ent.title + " List', href: paths.dashboard.Powertool." + ent.name + ".root },\n" +
"          { name: 'Edit " + ent.singular + "' },\n" +
"        ]}\n" +
"        sx={{ mb: { xs: 3, md: 5 } }}\n" +
"      />\n" +
"\n" +
"      <Card sx={{ p: 3 }}>\n" +
"        <Grid container spacing={3}>\n" +
"          <Grid item xs={12} md={6}>\n" +
"            <TextField fullWidth label=\"Field 1\" defaultValue=\"Sample Data 1\" />\n" +
"          </Grid>\n" +
"          <Grid item xs={12} md={6}>\n" +
"            <TextField fullWidth label=\"Field 2\" defaultValue=\"Sample Data 2\" />\n" +
"          </Grid>\n" +
"          <Grid item xs={12} md={6}>\n" +
"            <TextField fullWidth label=\"Field 3\" defaultValue=\"Sample Data 3\" />\n" +
"          </Grid>\n" +
"          <Grid item xs={12} md={6}>\n" +
"            <TextField fullWidth label=\"Field 4\" defaultValue=\"Sample Data 4\" />\n" +
"          </Grid>\n" +
"        </Grid>\n" +
"        <Stack direction=\"row\" justifyContent=\"flex-end\" mt={3}>\n" +
"          <Button variant=\"contained\" color=\"primary\">Update</Button>\n" +
"        </Stack>\n" +
"      </Card>\n" +
"    </Container>\n" +
"  );\n" +
"}\n";

  if (fs.existsSync(editFile)) {
    fs.writeFileSync(editFile, editCode);
  }
});

console.log('Forms refactored perfectly!');
