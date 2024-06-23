import ImageKit from 'imagekit';
import DB from '@/instance/database';

const config = {
  published: {
    public_key: 'public_jaWr3MiU2vVoVzxQQbHx/a5cmW8=',
    private_key: 'private_thJ6A6sD6YiP1kpsfLtD/zlt4wc=',
    URL_endpoint: 'https://ik.imagekit.io/x9vvwb5waj/',
    base64: 'cHJpdmF0ZV90aEo2QTZzRDZZaVAxa3BzZkx0RC96bHQ0d2M9:',
  },
  official: {
    public_key: 'public_eGImrCounAzuNW3z0cxUys/4bws=',
    private_key: 'private_cSm2dwHXmUwGw40EeyphZimVhEE=',
    URL_endpoint: 'https://ik.imagekit.io/hjthkoewn/',
    base64: 'cHJpdmF0ZV9jU20yZHdIWG1Vd0d3NDBFZXlwaFppbVZoRUU9:',
  },
};

const imagekit = new ImageKit({
  publicKey: config['published'].public_key,
  privateKey: config['published'].private_key,
  urlEndpoint: config['published'].URL_endpoint,
});
export default async function deleteCachedPhotos() {
  const cacheCollection = DB.db('cache').collection('deletedPhotos');
  try {
    const fileArray = await cacheCollection.find({}).toArray();
    if (fileArray.length === 0) return console.log('no image to be deleted!');
    let count = 0;
    while (fileArray[count]) {
      const { fileId } = fileArray[count];
      const res = await removing(fileId);
      console.log(res);
      if (res) {
        const deleteRes = await cacheCollection.deleteOne({ fileId });
        console.log('deleted:', deleteRes.deletedCount);
      }
      count++;
    }
    return count;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function removing(id: string) {
  try {
    const res = await imagekit.deleteFile(id);
    return res;
  } catch (e) {
    if (e.message.includes('not exist')) return true;
    return false;
  }
}
