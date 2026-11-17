Using Cloudinary, create a page in this project that generates the standard social media image variants for an asset in the identified product environment.

First, confirm the asset's public_id from our Cloudinary account before generating any URLs.

Generate delivery URLs for these aspect ratios using g_auto for smart cropping:

1:1 (square)
4:5 (portrait)
9:16 (story)
16:9 (landscape)

Include f_auto and q_auto in every delivery URL.

For each variant, display:

The aspect ratio and intended use.
The complete delivery URL.
A working <img> element that renders the transformed image.

Display the images at a reasonable preview size for the page (for example, max-width: 300px; height: auto; or an equivalent responsive style). Do not display the images at their full intrinsic size.