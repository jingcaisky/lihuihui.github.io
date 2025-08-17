document.addEventListener('DOMContentLoaded', function() {
    // 移动端菜单切换
    const mobileMenuButton = document.querySelector('.md\\:hidden');
    const mobileMenu = document.querySelector('.md\\:flex');
    
    mobileMenuButton.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
        mobileMenu.classList.toggle('flex');
        mobileMenu.classList.toggle('flex-col');
        mobileMenu.classList.toggle('absolute');
        mobileMenu.classList.toggle('top-16');
        mobileMenu.classList.toggle('left-0');
        mobileMenu.classList.toggle('right-0');
        mobileMenu.classList.toggle('bg-white');
        mobileMenu.classList.toggle('p-4');
        mobileMenu.classList.toggle('shadow-lg');
    });

    // 表单提交处理
    const contactForm = document.querySelector('form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 获取表单数据
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value
            };
            
            // 这里可以添加AJAX提交逻辑
            console.log('表单提交:', formData);
            
            // 显示成功消息
            alert('感谢您的留言！我会尽快回复您。');
            contactForm.reset();
        });
    }

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // 关闭移动菜单
                if (!mobileMenu.classList.contains('hidden')) {
                    mobileMenuButton.click();
                }
            }
        });
    });
});
