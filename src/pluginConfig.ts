import type { ExternalPluginConfig } from '@windy/interfaces';

const config: ExternalPluginConfig = {
    name: 'windy-plugin-ofp',
    version: '0.1.0',
    icon: '✈️',
    title: 'OFP Route',
    description: 'OFPのGPXルートをWindy上に表示し、各ウェイポイントの気象データを取得します。',
    author: 'Takayuki Matsumoto',
    repository: 'https://github.com/windycom/windy-plugin-template',
    desktopUI: 'rhpane',
    mobileUI: 'fullscreen',
    routerPath: '/ofp-route',
    private: true,
};

export default config;
