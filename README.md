# Nenamaga - Your Path to Excellence

A modern, fast, and SEO-optimized website for accessing free Sri Lankan school past question papers for Grades 6-13.

## 🎯 Features

- ✅ Fast & Responsive Design
- ✅ Papers for Grades 6-13 
- ✅ Multiple Mediums (Sinhala, Tamil, English)
- ✅ SEO Optimized with Structured Data
- ✅ Mobile-First Approach
- ✅ Zero Hosting Cost (Cloudflare Pages)
- ✅ Automated Google Drive Integration

## 🚀 Tech Stack

- **Framework**: Astro 5
- **Styling**: Tailwind CSS
- **UI Components**: React
- **Hosting**: Cloudflare Pages
- **Automation**: GitHub Actions

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

1. **Update Site URL**: Edit `astro.config.mjs` with your domain
2. **Configure Google Drive**: Set up GitHub Secrets (see below)
3. **Update Contact Info**: Modify contact details in relevant pages

## 🔑 Required GitHub Secrets

For automated paper updates from Google Drive:

- `GOOGLE_CREDENTIALS` - Service account JSON credentials
- `SPREADSHEET_ID` - Google Sheets ID (optional)
- `FOLDER_ID` - Google Drive folder ID

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Contact

For any questions or concerns, please open an issue on GitHub.
