import { defineConfig } from 'vitepress';

const version = process.env.npm_package_version || '0.0.0';

export default defineConfig({
    title: 'TrainLink Command',
    base: '/trainlink-command',
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            {
                text: 'Features',
                link: '/features',
            },
            {
                text: 'Download',
                link: '/download',
            },
            {
                text: 'Support',
                items: [
                    {
                        text: 'Getting Started',
                        link: '/support/getting-started',
                    },
                ],
            },
            { text: 'TrainLink', link: 'https://trainlink-org.github.io' },
            {
                text: 'TrainLink Connect',
                link: 'https://trainlink-org.github.io/trainlink-connect',
            },
            {
                text: version,
                items: [
                    {
                        text: 'Release',
                        link: `https://github.com/trainlink-org/trainlink-command/releases/tag/${version}`,
                    },
                    {
                        text: 'Changelog',
                        link: `https://github.com/trainlink-org/trainlink-command/blob/${version}/CHANGELOG.md`,
                    },
                ],
            },
        ],

        sidebar: {
            '/': [],
            '/support/': [
                {
                    text: 'The Basics',
                    items: [
                        {
                            text: 'Installing',
                            link: '/support/installing',
                        },
                        {
                            text: 'Getting Started',
                            link: '/support/getting-started',
                        },
                    ],
                },
                {
                    text: 'Configuration',
                    items: [
                        {
                            text: 'Overview',
                            link: '/support/config/',
                        },
                        {
                            text: 'Setting up locomotives',
                            link: '/support/config/locos',
                        },
                        {
                            text: 'Setting up turnouts',
                            link: '/support/config/turnouts',
                        },
                    ],
                },
                {
                    text: 'Automations',
                    items: [
                        {
                            text: 'The automation system',
                            link: '/support/automations/',
                        },
                        {
                            text: 'Writing automations',
                            link: '/support/automations/writing-automations',
                        },
                        {
                            text: 'Running automations',
                            link: '/support/automations/running-automations',
                        },
                    ],
                },
            ],
        },

        socialLinks: [
            {
                icon: 'github',
                link: 'https://github.com/trainlink-org/trainlink-command',
            },
        ],
        search: {
            provider: 'local',
        },
    },
});
