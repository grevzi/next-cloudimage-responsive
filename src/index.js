import { useContext } from 'react';

import CloudimageProvider, { CloudimageContext } from './provider';
import { Img as Image } from './Img';


function Img(props) {
  const config = useContext(CloudimageContext);

  return (
    <Image {...props} config={config} />
  );
}

function BackgroundImg(props) {
  const config = useContext(CloudimageContext);

  return (
    <Image background {...props} config={config} />
  );
}


// export default Img;
export { CloudimageProvider, Img, BackgroundImg };
