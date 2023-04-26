const cloudinary = require('cloudinary').v2;
const path = require('path');
cloudinary.config({
    secure: true,
    cloud_name: "dnteevm9m",
    api_key: "996348578293212",
    api_secret: "40p15GW_lLK43Fa4pGpxlDRO9tQ"

});

(async () => {
    const res = await cloudinary.uploader.upload(path.join(__dirname, "/public/images/christopher-gower-m_HRfLhgABo-unsplash.jpg"), {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        folder: "swiftr"
    }, (err, result) => {
        if (err) {
            console.log(err);
        }
        console.log(result);
    })
})();

