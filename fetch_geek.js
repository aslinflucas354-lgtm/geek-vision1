const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, 'data.json');

async function fetchGitHubProjects() {
    console.log('🚀 正在连接 GitHub API，获取全球硬核开源项目...');

    // 修复 422 错误：精简关键词数量，确保 OR 运算符不超过 5 个
    // 直接搜索硬核控制系统、仿真与底层硬件相关词汇
    const keywords = [
        'microgrid',
        'FSAE',
        'Simulink',
        'MPC',
        'hardware'
    ];
    
    // 拼接查询语句 (此时恰好有 4 个 OR，完全符合 GitHub API 规范)
    const query = encodeURIComponent(keywords.join(' OR '));
    const url = `https://api.github.com/search/repositories?q=${query}&sort=updated&order=desc&per_page=30`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'DIY-Tech-Aggregator-NodeJS',
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`GitHub API 拒绝了请求: HTTP ${response.status} - ${errText}`);
        }

        const data = await response.json();
        const items = data.items;

        const formattedData = items.map(repo => {
            return {
                title: repo.name,
                description: repo.description || '暂无描述',
                author: repo.owner.login,
                platform: 'github', 
                bvid: repo.id.toString(),
                url: repo.html_url,
                tags: repo.topics && repo.topics.length > 0 ? repo.topics.slice(0, 3) : ['开源工程'],
                cover: repo.owner.avatar_url,
                publish_time: new Date(repo.updated_at).toLocaleString('zh-CN'),
                stars: repo.stargazers_count
            };
        });

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(formattedData, null, 2), 'utf-8');
        
        console.log(`✅ 抓取成功！完美获取了 ${formattedData.length} 个硬核开源项目。`);
        console.log(`📁 数据已保存至: ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('❌ 网络请求失败:', error.message);
    }
}

fetchGitHubProjects();
