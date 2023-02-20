/** @type {import('next-sitemap').IConfig} */

module.exports = {
  siteUrl: process.env.SITE_URL || 'https://reka.js.org',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
};
