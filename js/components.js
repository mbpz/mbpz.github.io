// 组件加载器
(function() {
    'use strict';
    
    // 计算相对于根目录的路径
    function getBasePath() {
        const href = window.location.href;
        const pathname = window.location.pathname;
        
        // 处理 file:// 协议的情况（本地文件系统）
        if (href.startsWith('file://')) {
            try {
                // 获取当前文件的完整路径
                const url = new URL(href);
                let fullPath = decodeURIComponent(url.pathname);
                
                // 移除开头的斜杠
                fullPath = fullPath.replace(/^\//, '');
                
                // 分割路径
                const parts = fullPath.split('/');
                
                // 查找项目根目录（mbpz.github.io）
                const projectIndex = parts.indexOf('mbpz.github.io');
                if (projectIndex !== -1) {
                    // 项目目录后的部分（项目内的路径）
                    const projectParts = parts.slice(projectIndex + 1);
                    
                    // 移除文件名（最后一个 .html 文件）
                    if (projectParts.length > 0 && projectParts[projectParts.length - 1].endsWith('.html')) {
                        projectParts.pop();
                    }
                    
                    // 计算目录深度（从当前目录返回到项目根目录）
                    const depth = projectParts.length;
                    if (depth === 0) {
                        return './';
                    } else {
                        return '../'.repeat(depth);
                    }
                } else {
                    // 如果找不到项目目录，尝试其他方法
                    // 查找最后一个 .html 文件的位置
                    let htmlIndex = -1;
                    for (let i = parts.length - 1; i >= 0; i--) {
                        if (parts[i].endsWith('.html')) {
                            htmlIndex = i;
                            break;
                        }
                    }
                    
                    if (htmlIndex === -1) {
                        return './';
                    }
                    
                    // 简单判断：如果文件名是 index.html 且在路径末尾，可能是根目录
                    // 但这不可靠，所以返回 './' 作为默认值
                    return './';
                }
            } catch (e) {
                console.error('路径解析错误:', e);
                return './';
            }
        } else {
            // HTTP/HTTPS 协议（服务器环境）
            let serverPath = pathname.replace(/^\//, '');
            
            // 如果是根目录或只有index.html
            if (!serverPath || serverPath === 'index.html' || serverPath === '') {
                return './';
            }
            
            // 移除文件名
            const parts = serverPath.split('/');
            if (parts.length > 0 && parts[parts.length - 1].endsWith('.html')) {
                parts.pop();
            }
            
            // 过滤空字符串
            const pathParts = parts.filter(part => part);
            
            // 如果没有任何路径部分，返回当前目录
            if (pathParts.length === 0) {
                return './';
            }
            
            // 计算需要返回的层级数
            const depth = pathParts.length;
            return '../'.repeat(depth);
        }
    }
    
    // 获取侧边栏HTML（内联版本，用于本地文件系统）
    function getSidebarHTML() {
        return `<div id="sidebar">
    <div class="logo-container">
        <svg class="logo-window" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <!-- 科技蓝圆形窗口背景 -->
            <circle class="window-bg" cx="60" cy="60" r="55" fill="#1e3a8a" />
            <circle class="window-inner" cx="60" cy="60" r="50" fill="#3b82f6" />
            
            <!-- 窗口边框效果 -->
            <circle class="window-border" cx="60" cy="60" r="52" fill="none" stroke="#60a5fa" stroke-width="2" opacity="0.5" />
            
            <!-- Emo科技人卡通 - 初始状态（在窗口内） -->
            <g class="character" transform="translate(60, 75)">
                <!-- 身体 -->
                <rect x="-15" y="5" width="30" height="25" rx="5" fill="#4a5568" />
                <!-- 头部 -->
                <circle class="head" cx="0" cy="0" r="18" fill="#2d3748" />
                <!-- 眼睛（emo风格，向下看） -->
                <ellipse cx="-6" cy="-3" rx="3" ry="4" fill="#fff" />
                <ellipse cx="6" cy="-3" rx="3" ry="4" fill="#fff" />
                <!-- 嘴巴（emo风格，向下弯曲） -->
                <path class="mouth-sad" d="M -8 3 Q 0 1 8 3" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" />
                <!-- 嘴巴（微笑，向上弯曲） -->
                <path class="mouth-happy" d="M -8 3 Q 0 7 8 3" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity="0" />
                <!-- 科技元素 - 天线 -->
                <line x1="0" y1="-18" x2="0" y2="-25" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round" />
                <circle cx="0" cy="-25" r="2" fill="#ff6b6b" />
            </g>
            
            <!-- 红色外圈 -->
            <circle class="red-circle" cx="60" cy="60" r="58" fill="none" stroke="#dc2626" stroke-width="4" />
        </svg>
    </div>
    <h1>我的博客</h1>
    <nav id="sidebar-nav">
        <a href="#" data-page="index.html">首页</a>
        <a href="#" data-page="about/index.html">关于</a>
        <a href="#" data-page="archives/index.html">归档</a>
        <a href="#" data-page="categories/index.html">分类</a>
        <a href="#" data-page="tags/index.html">标签</a>
    </nav>
</div>`;
    }
    
    // 加载侧边栏
    function loadSidebar() {
        const basePath = getBasePath();
        const sidebarPath = basePath + 'components/sidebar.html';
        
        // 检测是否是本地文件系统（file://协议）
        const isLocalFile = window.location.protocol === 'file:';
        
        if (isLocalFile) {
            // 本地文件系统：直接使用内联HTML
            const html = getSidebarHTML();
            document.body.insertAdjacentHTML('afterbegin', html);
            updateNavLinks(basePath);
            setActiveNav();
        } else {
            // 服务器环境：使用fetch加载
            fetch(sidebarPath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('无法加载侧边栏组件');
                    }
                    return response.text();
                })
                .then(html => {
                    // 插入侧边栏HTML
                    document.body.insertAdjacentHTML('afterbegin', html);
                    
                    // 更新导航链接
                    updateNavLinks(basePath);
                    
                    // 设置当前页面为active
                    setActiveNav();
                })
                .catch(error => {
                    console.error('加载侧边栏失败，使用内联版本:', error);
                    // 如果加载失败，使用内联版本
                    const html = getSidebarHTML();
                    document.body.insertAdjacentHTML('afterbegin', html);
                    updateNavLinks(basePath);
                    setActiveNav();
                });
        }
    }
    
    // 更新导航链接的href
    function updateNavLinks(basePath) {
        const navLinks = document.querySelectorAll('#sidebar-nav a');
        const pageMap = {
            'index.html': 'index.html',
            'about/index.html': 'about/index.html',
            'archives/index.html': 'archives/index.html',
            'categories/index.html': 'categories/index.html',
            'tags/index.html': 'tags/index.html'
        };
        
        const isLocalFile = window.location.protocol === 'file:';
        
        navLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            if (page && pageMap[page]) {
                // 构建目标路径
                let targetPath;
                
                // 如果 basePath 是 './'，直接使用目标路径
                if (basePath === './' || basePath === '') {
                    targetPath = pageMap[page];
                } else {
                    // 否则拼接路径
                    targetPath = basePath + pageMap[page];
                    // 移除重复的斜杠
                    targetPath = targetPath.replace(/\/+/g, '/');
                }
                
                // 确保相对路径格式正确
                // 移除开头的 ./（如果存在）
                if (targetPath.startsWith('./')) {
                    targetPath = targetPath.substring(2);
                }
                
                // 确保不以 / 开头（相对路径）
                if (targetPath.startsWith('/')) {
                    targetPath = targetPath.substring(1);
                }
                
                // 设置链接
                link.href = targetPath;
            }
        });
    }
    
    // 设置当前页面的active状态
    function setActiveNav() {
        const currentPath = window.location.pathname;
        const currentHref = window.location.href;
        const navLinks = document.querySelectorAll('#sidebar-nav a');
        
        navLinks.forEach(link => {
            let linkPath = '';
            let linkHref = link.href;
            
            // 处理相对路径和绝对路径
            try {
                if (linkHref.startsWith('http://') || linkHref.startsWith('https://') || linkHref.startsWith('file://')) {
                    const url = new URL(linkHref);
                    linkPath = url.pathname;
                } else {
                    // 相对路径，需要转换为绝对路径
                    const baseUrl = new URL(currentHref);
                    const resolvedUrl = new URL(linkHref, baseUrl);
                    linkPath = resolvedUrl.pathname;
                }
            } catch (e) {
                // 如果URL解析失败，直接使用href
                linkPath = linkHref;
            }
            
            // 规范化路径
            let normalizedCurrent = currentPath.replace(/\/$/, '') || '/index.html';
            let normalizedLink = linkPath.replace(/\/$/, '') || '/index.html';
            
            // 移除开头的斜杠（对于本地文件系统）
            if (normalizedCurrent.startsWith('/')) {
                normalizedCurrent = normalizedCurrent.substring(1);
            }
            if (normalizedLink.startsWith('/')) {
                normalizedLink = normalizedLink.substring(1);
            }
            
            // 检查是否是当前页面
            if (normalizedCurrent === normalizedLink || 
                normalizedCurrent.endsWith('/' + normalizedLink) ||
                normalizedLink.endsWith('/' + normalizedCurrent) ||
                (normalizedCurrent === 'index.html' && normalizedLink === 'index.html') ||
                (normalizedCurrent === '' && normalizedLink === 'index.html')) {
                link.classList.add('active');
            }
        });
    }
    
    // 页面加载时加载侧边栏
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadSidebar);
    } else {
        loadSidebar();
    }
})();

