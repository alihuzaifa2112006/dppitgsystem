import { Helmet } from 'react-helmet-async';
import { RecipeGridView } from 'src/sections/recipe/view';

// ----------------------------------------------------------------------

export default function ProfileGridPage() {
  return (
    <>
      <Helmet>
        <title> Recipe : List View</title>
      </Helmet>

      <RecipeGridView />
      
    </>
  );
}
