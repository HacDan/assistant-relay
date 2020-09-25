module.exports = {
  title: 'Assistant Relay',
  tagline: 'Exposing the Google Assistant Service as a REST API',
  url: 'https://greghesp.github.io',
  //url: 'https://www.assistantrelay.com',
  baseUrl: '/assistant-relay/',
  // baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'greghesp', // Usually your GitHub org/user name.
  projectName: 'assistant-relay', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'Assistant Relay',
      logo: {
        alt: 'Assistant Relay Logo',
        src: 'img/logo.svg',
      },
      links: [
        {to: 'docs/introduction', label: 'Docs', position: 'left'},
        {href: `https://github.com/greghesp/assistant-relay/releases/latest`, label: 'Download', position: 'left'},
        {href: `https://github.com/greghesp/assistant-relay/issues/new/choose`, label: 'Report an Issue', position: 'right'},
        // {to: 'blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/greghesp/assistant-relay',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: 'docs/introduction',
            },
            {
              label: 'Getting Started',
              to: 'docs/getting-started/installation',
            },
            {
              label: 'Commands',
              to: 'docs/commands/broadcast',
            },
            {
              label: 'Casting',
              to: 'docs/cast/casting',
            },
            {
              label: 'Smart Home Integration',
              to: 'docs/integration/webcore',
            },
            {
              label: 'F.A.Q',
              to: 'docs/other/faq',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/Jz8AM9k',
            }
          ],
        },
        {
          title: 'Social',
          items: [
            // {
            //   label: 'Blog',
            //   to: 'blog',
            // },
            {
              label: 'GitHub',
              href: 'https://github.com/greghesp/assistant-relay',
            }
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Assistant Relay. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: '../docs',
          sidebarPath: require.resolve('../docs/sidebars.js'),
          editUrl: 'https://github.com/greghesp/assistant-relay/edit/doc-src/',
        },
        theme: {
          customCss: require.resolve('./src/styles.css'),
        },
      },
    ],
  ],
  plugins: [require.resolve('@docusaurus/plugin-ideal-image')],
};
