const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/SupportPage.jsx',
  'src/pages/ProfilePage.jsx',
  'src/pages/portfolio/PortfolioEditorPage.jsx',
  'src/pages/HowToUsePage.jsx',
  'src/pages/ExpensesPage.jsx',
  'src/pages/ExpenseRecordsPage.jsx',
  'src/pages/ChangePasswordPage.jsx'
];

files.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  if (file.includes('SupportPage')) {
    content = content.replace(/<SEO title="Support \| DentStory" \/>/, `<SEO title={t('seo.support', 'Support | DentStory')} />`);
  } else if (file.includes('ProfilePage')) {
    content = content.replace(/<SEO title="My Profile" noindex \/>/, `<SEO title={t('seo.myProfile', 'My Profile')} noindex />`);
  } else if (file.includes('PortfolioEditorPage')) {
    content = content.replace(/<SEO title="Portfolio Editor" noindex \/>/g, `<SEO title={t('seo.portfolioEditor', 'Portfolio Editor')} noindex />`);
  } else if (file.includes('HowToUsePage')) {
    content = content.replace(/<SEO title="How to Use DentStory" \/>/, `<SEO title={t('seo.howToUse', 'How to Use DentStory')} />`);
  } else if (file.includes('ExpensesPage')) {
    content = content.replace(/<SEO title="Expenses \| DentStory" \/>/, `<SEO title={t('seo.expenses', 'Expenses | DentStory')} />`);
  } else if (file.includes('ExpenseRecordsPage')) {
    content = content.replace(/<SEO title="Expense Records \| DentStory" \/>/, `<SEO title={t('seo.expenseRecords', 'Expense Records | DentStory')} />`);
  } else if (file.includes('ChangePasswordPage')) {
    content = content.replace(/<SEO title="Change Password" noindex \/>/, `<SEO title={t('seo.changePassword', 'Change Password')} noindex />`);
  }

  fs.writeFileSync(fullPath, content);
  console.log('Updated ' + file);
});
