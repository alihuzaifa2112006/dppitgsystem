import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router';
import { RecipeView } from 'src/sections/recipe/view';



// ----------------------------------------------------------------------

export default function AccountPage() {
  const params = useParams();
  return (
    <>
      <Helmet>
        <title>Recipe : Edit</title>
      </Helmet>

      <RecipeView urlData={params}/>
    </>
  );
}