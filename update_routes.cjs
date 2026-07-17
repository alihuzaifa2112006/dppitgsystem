const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/routes/sections/dashboard.jsx');
let content = fs.readFileSync(file, 'utf8');

const entities = [
  { name: 'Office', path: 'offices' },
  { name: 'Factory', path: 'factories' },
  { name: 'TransactionType', path: 'transaction-types' },
  { name: 'PaymentTerm', path: 'payment-terms' },
  { name: 'PaymentMode', path: 'payment-modes' },
  { name: 'Incoterm', path: 'incoterms' },
  { name: 'TransportMode', path: 'transport-modes' },
  { name: 'Composition', path: 'composition' },
  { name: 'BuyingDepartment', path: 'buying-departments' },
];

let importsStr = '';
entities.forEach(ent => {
  importsStr += `const ${ent.name}ListPage = lazy(() => import('src/pages/dashboard/Powertool/${ent.name}/list'));\n`;
  importsStr += `const ${ent.name}NewPage = lazy(() => import('src/pages/dashboard/Powertool/${ent.name}/new'));\n`;
  importsStr += `const ${ent.name}EditPage = lazy(() => import('src/pages/dashboard/Powertool/${ent.name}/edit'));\n`;
});

// Inject imports right before "export const dashboardRoutes"
content = content.replace('export const dashboardRoutes = [', importsStr + '\nexport const dashboardRoutes = [');

let routesStr = '';
entities.forEach(ent => {
  routesStr += `
      {
        path: 'powertool/${ent.path}',
        children: [
          {
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <${ent.name}ListPage />
              </Suspense>
            ),
            index: true,
          },
          {
            path: 'new',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <${ent.name}NewPage />
              </Suspense>
            ),
          },
          {
            path: 'edit/:id',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <${ent.name}EditPage />
              </Suspense>
            ),
          },
        ],
      },`;
});

// Inject routes right after "path: 'powertool/customers', children: [...],"
const injectMarker = "path: 'powertool/customers',";
const blockEnd = `
        ],
      },`;
// Find the exact spot to inject the new routes
const customerBlockIndex = content.indexOf(injectMarker);
if (customerBlockIndex !== -1) {
  const nextBlockEndIndex = content.indexOf('],', customerBlockIndex + injectMarker.length + 500);
  const finalInsertionIndex = content.indexOf('},', nextBlockEndIndex) + 2;
  
  content = content.slice(0, finalInsertionIndex) + routesStr + content.slice(finalInsertionIndex);
} else {
  console.log("Could not find customer route block!");
}

fs.writeFileSync(file, content);
console.log('Routes updated!');
