const fs = require('fs');
const path = require('path');

const entities = [
  { name: 'Office', title: 'Offices' },
  { name: 'Factory', title: 'Factories' },
  { name: 'TransactionType', title: 'Transaction Types' },
  { name: 'PaymentTerm', title: 'Payment Terms' },
  { name: 'PaymentMode', title: 'Payment Modes' },
  { name: 'Incoterm', title: 'Incoterms' },
  { name: 'TransportMode', title: 'Transport Modes' },
  { name: 'Composition', title: 'Composition' },
  { name: 'BuyingDepartment', title: 'Buying Departments' }
];

const sectionsBase = path.join(__dirname, 'src/sections/Powertool');

entities.forEach(ent => {
  const sectionDir = path.join(sectionsBase, ent.name);
  const gridFile = path.join(sectionDir, ent.name + '-sheet-grid.jsx');
  const listFile = path.join(sectionDir, ent.name + '-list.jsx');

  const listCode = "import React from 'react';\n" +
"import { Container, Button } from '@mui/material';\n" +
"import { useSettingsContext } from 'src/components/settings';\n" +
"import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';\n" +
"import Iconify from 'src/components/iconify';\n" +
"import { RouterLink } from 'src/routes/components';\n" +
"import { paths } from 'src/routes/paths';\n" +
"import " + ent.name + "SheetGrid from './" + ent.name + "-sheet-grid';\n" +
"\n" +
"export default function " + ent.name + "List() {\n" +
"  const settings = useSettingsContext();\n" +
"\n" +
"  return (\n" +
"    <Container maxWidth={settings.themeStretch ? false : 'lg'}>\n" +
"      <CustomBreadcrumbs\n" +
"        heading=\"" + ent.title + "\"\n" +
"        links={[\n" +
"          { name: 'Home', href: paths.dashboard.root },\n" +
"          { name: '" + ent.title + "' },\n" +
"        ]}\n" +
"        sx={{ mb: { xs: 3, md: 5 } }}\n" +
"        action={\n" +
"          <Button\n" +
"            component={RouterLink}\n" +
"            href={paths.dashboard.Powertool." + ent.name + ".new}\n" +
"            variant=\"contained\"\n" +
"            startIcon={<Iconify icon=\"mingcute:add-line\" />}\n" +
"            color=\"primary\"\n" +
"          >\n" +
"            Add " + ent.name + "\n" +
"          </Button>\n" +
"        }\n" +
"      />\n" +
"      <" + ent.name + "SheetGrid />\n" +
"    </Container>\n" +
"  );\n" +
"}\n";

  if (fs.existsSync(listFile)) {
    fs.writeFileSync(listFile, listCode);
  }

  if (fs.existsSync(gridFile)) {
    let gridCode = fs.readFileSync(gridFile, 'utf8');

    const regex = /<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>[\s\S]*?<\/Stack>/m;
    
    const replacement = 
"      <Paper\n" +
"        elevation={0}\n" +
"        sx={{\n" +
"          p: 2.5,\n" +
"          mb: 0,\n" +
"          borderRadius: '12px 12px 0 0',\n" +
"          border: '1px solid',\n" +
"          borderColor: 'divider',\n" +
"        }}\n" +
"      >\n" +
"        <TextField\n" +
"          fullWidth\n" +
"          placeholder=\"Search " + ent.title + "...\"\n" +
"          value={searchText}\n" +
"          onChange={(e) => { setSearchText(e.target.value); setPage(0); }}\n" +
"          sx={{\n" +
"            '& .MuiOutlinedInput-root': {\n" +
"              borderRadius: '12px',\n" +
"              height: '48px',\n" +
"              transition: 'box-shadow 0.2s ease',\n" +
"              '&:hover fieldset': { borderColor: 'primary.main' },\n" +
"              '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '2px' },\n" +
"              '&.Mui-focused': {\n" +
"                boxShadow: (th) => `0 0 0 3px ${th.palette.primary.main}14`,\n" +
"              },\n" +
"            },\n" +
"            '& .MuiInputBase-input': {\n" +
"              fontSize: '0.95rem',\n" +
"              padding: '8px 14px',\n" +
"            },\n" +
"          }}\n" +
"          InputProps={{\n" +
"            startAdornment: (\n" +
"              <InputAdornment position=\"start\">\n" +
"                <Iconify icon=\"eva:search-fill\" width={22} sx={{ color: 'text.secondary' }} />\n" +
"              </InputAdornment>\n" +
"            ),\n" +
"          }}\n" +
"        />\n" +
"      </Paper>";

    gridCode = gridCode.replace(regex, replacement);
    fs.writeFileSync(gridFile, gridCode);
  }
});

console.log('Layouts refactored perfectly!');
