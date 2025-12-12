// 上传页面脚本
document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const dropArea = document.getElementById('dropArea');
    const browseBtn = document.getElementById('browseBtn');
    const fileInput = document.getElementById('fileInput');
    const albumArtInput = document.getElementById('albumArtInput');
    const uploadAlbumArtBtn = document.getElementById('uploadAlbumArtBtn');
    const albumArtPreview = document.getElementById('albumArtPreview');
    const musicInfoForm = document.getElementById('musicInfoForm');
    const uploadProgress = document.getElementById('uploadProgress');
    const uploadProgressBar = document.getElementById('uploadProgressBar');
    const uploadProgressText = document.getElementById('uploadProgressText');
    const uploadFileInfo = document.getElementById('uploadFileInfo');
    const cancelUploadBtn = document.getElementById('cancelUploadBtn');
    const resetFormBtn = document.getElementById('resetFormBtn');
    const uploadSubmitBtn = document.getElementById('uploadSubmitBtn');
    
    // 上传状态
    let selectedFiles = [];
    let albumArtFile = null;
    let isUploading = false;
    
    // 初始化
    initUploadPage();
    
    function initUploadPage() {
        // 检查登录状态
        checkLoginStatus();
        
        // 事件监听器
        dropArea.addEventListener('dragover', handleDragOver);
        dropArea.addEventListener('dragleave', handleDragLeave);
        dropArea.addEventListener('drop', handleDrop);
        
        browseBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileSelect);
        
        uploadAlbumArtBtn.addEventListener('click', () => albumArtInput.click());
        albumArtInput.addEventListener('change', handleAlbumArtSelect);
        
        musicInfoForm.addEventListener('submit', handleFormSubmit);
        resetFormBtn.addEventListener('click', resetForm);
        cancelUploadBtn.addEventListener('click', cancelUpload);
        
        // 登录按钮事件
        document.getElementById('loginBtn').addEventListener('click', () => {
            // 这里应该打开登录模态框，简化处理
            alert('请先登录才能上传音乐');
        });
        
        // 移动端菜单
        document.querySelector('.mobile-menu-btn').addEventListener('click', toggleMobileMenu);
    }
    
    // 处理拖放
    function handleDragOver(e) {
        e.preventDefault();
        dropArea.style.borderColor = 'var(--primary-color)';
        dropArea.style.backgroundColor = 'var(--secondary-color)';
    }
    
    function handleDragLeave(e) {
        e.preventDefault();
        dropArea.style.borderColor = '#ddd';
        dropArea.style.backgroundColor = '';
    }
    
    function handleDrop(e) {
        e.preventDefault();
        dropArea.style.borderColor = '#ddd';
        dropArea.style.backgroundColor = '';
        
        const files = e.dataTransfer.files;
        handleFiles(files);
    }
    
    // 处理文件选择
    function handleFileSelect(e) {
        const files = e.target.files;
        handleFiles(files);
    }
    
    // 处理文件
    function handleFiles(files) {
        selectedFiles = [];
        
        // 过滤出音频文件
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.startsWith('audio/') || 
                ['.mp3', '.wav', '.flac'].some(ext => file.name.toLowerCase().endsWith(ext))) {
                selectedFiles.push(file);
            }
        }
        
        if (selectedFiles.length > 0) {
            // 更新表单中的音乐标题和艺术家（使用文件名）
            const firstFile = selectedFiles[0];
            const fileName = firstFile.name.replace(/\.[^/.]+$/, ""); // 移除扩展名
            
            document.getElementById('musicTitle').value = fileName;
            document.getElementById('artistName').value = '我';
            
            // 显示文件信息
            uploadFileInfo.innerHTML = `
                <p><strong>已选择 ${selectedFiles.length} 个文件：</strong></p>
                <ul>
                    ${selectedFiles.map(file => `<li>${file.name} (${formatFileSize(file.size)})</li>`).join('')}
                </ul>
            `;
            
            // 显示上传进度区域
            uploadProgress.style.display = 'block';
            
            // 自动滚动到表单
            document.querySelector('.upload-form').scrollIntoView({ behavior: 'smooth' });
        } else {
            alert('请选择有效的音频文件（MP3, WAV, FLAC）');
        }
    }
    
    // 处理专辑封面选择
    function handleAlbumArtSelect(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            albumArtFile = file;
            
            // 显示预览
            const reader = new FileReader();
            reader.onload = function(e) {
                albumArtPreview.innerHTML = `<img src="${e.target.result}" alt="专辑封面预览">`;
                albumArtPreview.classList.add('has-image');
            };
            reader.readAsDataURL(file);
        } else {
            alert('请选择有效的图片文件');
        }
    }
    
    // 处理表单提交
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // 检查是否已选择文件
        if (selectedFiles.length === 0) {
            alert('请先选择要上传的音乐文件');
            return;
        }
        
        // 检查登录状态
        const user = localStorage.getItem('user');
        if (!user) {
            alert('请先登录才能上传音乐');
            return;
        }
        
        // 开始上传
        startUpload();
    }
    
    // 开始上传
    function startUpload() {
        isUploading = true;
        uploadSubmitBtn.disabled = true;
        uploadSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 上传中...';
        
        // 模拟上传进度
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 5;
            if (progress > 100) progress = 100;
            
            updateProgress(progress);
            
            if (progress === 100) {
                clearInterval(progressInterval);
                uploadComplete();
            }
        }, 200);
        
        // 保存取消上传的函数
        cancelUploadBtn.onclick = function() {
            clearInterval(progressInterval);
            cancelUpload();
        };
    }
    
    // 更新上传进度
    function updateProgress(percent) {
        uploadProgressBar.style.width = `${percent}%`;
        uploadProgressText.textContent = `${percent}%`;
    }
    
    // 上传完成
    function uploadComplete() {
        isUploading = false;
        
        // 获取表单数据
        const title = document.getElementById('musicTitle').value;
        const artist = document.getElementById('artistName').value;
        const album = document.getElementById('albumName').value;
        const genre = document.getElementById('musicGenre').value;
        const description = document.getElementById('musicDescription').value;
        
        // 生成模拟的音乐数据
        const newMusic = {
            id: Date.now(),
            title: title || selectedFiles[0].name.replace(/\.[^/.]+$/, ""),
            artist: artist || '我',
            album: album || '单曲',
            genre: genre || 'other',
            description: description || '',
            duration: '3:45', // 模拟数据
            likes: 0,
            uploadDate: new Date().toISOString().split('T')[0],
            liked: false
        };
        
        // 如果有专辑封面，使用预览
        if (albumArtPreview.classList.contains('has-image')) {
            const img = albumArtPreview.querySelector('img');
            newMusic.albumArt = img.src;
        } else {
            // 使用默认图片
            newMusic.albumArt = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80';
        }
        
        // 生成模拟的直链
        newMusic.src = `https://pinkmusic.example.com/uploads/${newMusic.id}.mp3`;
        
        // 显示成功消息
        uploadFileInfo.innerHTML += `
            <div class="upload-success">
                <i class="fas fa-check-circle"></i>
                <h4>上传成功！</h4>
                <p>歌曲 "${newMusic.title}" 已成功上传到您的个人空间。</p>
                <div class="success-actions">
                    <button class="btn-small-pink" onclick="window.location.href='dashboard.html'">
                        查看个人空间
                    </button>
                    <button class="btn-outline-pink" onclick="copyDirectLink('${newMusic.src}')">
                        复制直链
                    </button>
                </div>
            </div>
        `;
        
        uploadSubmitBtn.innerHTML = '<i class="fas fa-check"></i> 上传完成';
        
        // 保存到本地存储（模拟服务器保存）
        saveMusicToLocalStorage(newMusic);
    }
    
    // 保存音乐到本地存储
    function saveMusicToLocalStorage(music) {
        // 获取现有音乐
        let userMusic = JSON.parse(localStorage.getItem('userMusic')) || [];
        
        // 添加新音乐
        userMusic.push(music);
        
        // 保存回本地存储
        localStorage.setItem('userMusic', JSON.stringify(userMusic));
    }
    
    // 取消上传
    function cancelUpload() {
        isUploading = false;
        uploadSubmitBtn.disabled = false;
        uploadSubmitBtn.innerHTML = '<i class="fas fa-upload"></i> 上传音乐';
        
        uploadProgressBar.style.width = '0%';
        uploadProgressText.textContent = '0%';
        
        uploadFileInfo.innerHTML = '';
    }
    
    // 重置表单
    function resetForm() {
        if (!isUploading) {
            musicInfoForm.reset();
            selectedFiles = [];
            albumArtFile = null;
            albumArtPreview.innerHTML = '<i class="fas fa-image"></i><p>预览</p>';
            albumArtPreview.classList.remove('has-image');
            uploadProgress.style.display = 'none';
            uploadFileInfo.innerHTML = '';
        } else {
            alert('上传进行中，无法重置表单');
        }
    }
    
    // 复制直链函数（全局）
    window.copyDirectLink = function(link) {
        const tempInput = document.createElement('input');
        tempInput.value = link;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        alert('直链已复制到剪贴板！');
    };
    
    // 辅助函数：格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // 检查登录状态
    function checkLoginStatus() {
        const user = localStorage.getItem('user');
        const loginBtn = document.getElementById('loginBtn');
        
        if (user) {
            const userData = JSON.parse(user);
            loginBtn.innerHTML = `<i class="fas fa-user"></i> ${userData.username}`;
        }
    }
    
    // 切换移动端菜单
    function toggleMobileMenu() {
        document.querySelector('.nav-links').classList.toggle('active');
    }
});
