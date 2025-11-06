export default class Slider {
  constructor(options={}) {
    const {
      articles,
      clickCallback = () => {}
    } = options;
    // 侧边菜单逻辑
    const menuIcon = document.getElementById('menuIcon');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const closeBtn = document.getElementById('closeBtn');

    const menuList = document.querySelector(".menu-list");
    articles.forEach(item=>{
      const menuItem = document.createElement("li");
      menuItem.classList.add("menu-item");
      menuItem.innerHTML = item.title;
      menuList.appendChild(menuItem);
      menuItem.addEventListener("click", () => {
        closeSidebar();
        clickCallback(item);
      })
    })

    function openSidebar() {
      sidebar.classList.add('active');
      overlay.classList.add('active');
      document.body.classList.add('sidebar-open');
    }

    function closeSidebar() {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      document.body.classList.remove('sidebar-open');
    }

    // 打开菜单
    menuIcon.addEventListener('click', openSidebar);

    // 关闭菜单：点击关闭按钮或遮罩层
    closeBtn.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);

    // 可选：ESC 键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('active')) {
        closeSidebar();
      }
    });
  }
}
