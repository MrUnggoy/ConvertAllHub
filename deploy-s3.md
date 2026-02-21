# S3 Deployment Guide - ConvertAll Hub

## 🚨 CSS Missing Issue - Solutions

### **Quick Fix (If already uploaded):**

1. **Go to S3 Console** → Your bucket → `assets/` folder
2. **Select the CSS file** (e.g., `index-CVfC0ECL.css`)
3. **Actions** → **Edit metadata**
4. **Add/Edit metadata:**
   - **Key**: `Content-Type`
   - **Value**: `text/css`
5. **Save changes**
6. **Clear browser cache** and test

### **Proper Upload Method:**

#### **Option 1: AWS CLI (Recommended)**
```bash
# Install AWS CLI first, then:
aws s3 sync ./dist s3://your-bucket-name --delete \
  --metadata-directive REPLACE \
  --content-type-by-extension \
  --cache-control "public, max-age=31536000" \
  --exclude "*.html" \
  --exclude "*.xml" \
  --exclude "*.txt"

# Upload HTML files separately (no cache)
aws s3 sync ./dist s3://your-bucket-name \
  --exclude "*" \
  --include "*.html" \
  --include "*.xml" \
  --include "*.txt" \
  --content-type "text/html" \
  --cache-control "public, max-age=0"
```

#### **Option 2: S3 Console Upload**
1. **Delete existing files** in your bucket
2. **Upload new dist folder contents**
3. **During upload**, click **Properties**
4. **Set metadata for each file type:**
   - `.css` files → `Content-Type: text/css`
   - `.js` files → `Content-Type: application/javascript`
   - `.html` files → `Content-Type: text/html`
   - `.xml` files → `Content-Type: application/xml`

#### **Option 3: CloudFront (Best for Production)**
1. **Create CloudFront distribution**
2. **Origin**: Your S3 bucket
3. **Behavior**: Cache CSS/JS for 1 year, HTML for 0
4. **Custom error pages**: 404 → /index.html (for SPA routing)

## 🔧 **Current Build Files:**
```
dist/
├── index.html (3.40 kB)
├── assets/
│   ├── index-CVfC0ECL.css (33.10 kB) ← Main CSS file
│   ├── index-zBYRnyYa.js (40.07 kB)  ← Main JS file
│   ├── vendor-BNuD-Iq5.js (160.48 kB) ← React/libraries
│   ├── pdf-CU__AqTB.js (916.00 kB)    ← PDF processing
│   └── [other tool files...]
```

## 🌐 **S3 Bucket Settings:**

### **Bucket Policy (Public Read):**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

### **Static Website Hosting:**
- **Index document**: `index.html`
- **Error document**: `index.html` (for SPA routing)

### **CORS Configuration:**
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

## 🧪 **Test Your Deployment:**

1. **Check CSS loading**: Open browser dev tools → Network tab
2. **Look for CSS file**: Should load with `200` status
3. **Check Content-Type**: Should be `text/css`
4. **Test all pages**: Homepage, tool pages, navigation

## 🚨 **Common Issues & Fixes:**

### **White Screen:**
- ✅ Check CSS Content-Type
- ✅ Check browser console for errors
- ✅ Verify all asset files uploaded

### **404 Errors on Tool Pages:**
- ✅ Set error document to `index.html`
- ✅ Use CloudFront for better SPA support

### **Slow Loading:**
- ✅ Enable gzip compression
- ✅ Set proper cache headers
- ✅ Use CloudFront CDN

---

**🎯 Your fresh build is ready in the `dist/` folder with proper optimization!**