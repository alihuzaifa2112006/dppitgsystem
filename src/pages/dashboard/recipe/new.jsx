import { Helmet } from 'react-helmet-async';
import { RecipeAddView } from 'src/sections/recipe/view';



// ----------------------------------------------------------------------

export default function AccountPage() {
  return (
    <>
      <Helmet>
        <title>Recipe: Add</title>
      </Helmet>

      <RecipeAddView />
    </>
  );
}
