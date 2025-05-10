document.addEventListener('DOMContentLoaded', function(){
    // Multiple usage variables
    const template = document.querySelector('template');

    // Pic in Pic variables
    const mediaStreamButton = document.querySelector('.button-container button');
    const videoElement = document.querySelector('#main-video');
    
    // Page swap variables
    const pages = template.content.querySelectorAll('.pages .page');
    
    const contentDiv = document.querySelector('.content');
    const pagesCircles = [];
    
    const buttonRight = document.querySelector('.turn-right');
    const buttonLeft = document.querySelector('.turn-left');
    
    const BUTTON_SWAP_COOLDOWN = 100;
    
    let currPage;
    let nextPage;
    let prevPage;
    let currPageIndex = 0;
    console.log(pages, pagesCircles, buttonLeft, buttonRight, contentDiv);
    
    // Вспомогательные функции
    function appendMultipleChildren(parent, children = []){
        children.forEach((elem) => {
            parent.appendChild(elem);
        });
    }

    // Включение/выключение кнопок
    function toggleButtons(buttons = []){
        buttons.forEach((button) =>{
            button.disabled = !button.disabled;
        });
    }

    
    
    
    // Функционал плавающего окна
    
    async function startPicInPic(){
        try {
            let mediaStream = await navigator.mediaDevices.getDisplayMedia();
            videoElement.srcObject = mediaStream;
            videoElement.onloadeddata = () => {
                videoElement.play();
                videoElement.requestPictureInPicture();
            };
        } catch (error) {
            alert('startPicInPic error ', error);
        }
    }
    
    // Функционал инструкции

    // Создает пипсы для обозначения настоящей страницы
    // Выполняется один раз при загрузке страницы
    function spawnPipsCircles(){
        // Получение в переменную контейнера, куда они будут создаваться
        const pipsContainer = document.querySelector('.pips-container');
        
        // Для каждой страницы создается новая пипса и добавляется в контейнер в DOM, а так же в массив со всеми пипсами
        // для дальнейших операций
        pages.forEach(() =>{
            pip = document.createElement('div');
            pip.classList.add('pip');
            
            pipsContainer.appendChild(pip);
            pagesCircles.push(pip);
        });
    }

    // Выключает все пипсы и включает ту, индекс в массиве которой соответствует индексу в массиве настоящей страницы
    function pipsUpdate(){
        pagesCircles.forEach((circle) => {
            circle.classList.remove('active');
        })

        pagesCircles[currPageIndex].classList.add('active');
    };
    
    // Подготавливаем страницы к взаимодействию с пользователем
    // Выполняется при загрузке страницы и каждый раз после нажатия кнопки
    function getPagesReadyToSwap(){
        // Создает страницу, отображаемую пользователю, если таковая отсутствует
        if(!currPage){
            currPage = pages[currPageIndex].cloneNode(true);
        }
        // Заранее создается следующая и предыдущая страницы, скрытые от пользователя
        nextPage = pages[currPageIndex >= pages.length - 1 ? 0 : currPageIndex + 1 ].cloneNode(true);
        prevPage = pages[currPageIndex <= 0 ? pages.length - 1 : currPageIndex - 1 ].cloneNode(true);
        
        // Расстановка созданных страниц
        currPage.style.left = 0;
        nextPage.style.left = '100%';
        prevPage.style.left = '-100%';
        
        // Добавляем страницы в свой контейнер
        appendMultipleChildren(contentDiv, [currPage, nextPage, prevPage]);
        
    }
    
    // Смена страниц
    function swapPages(newCurrPage, oldPrevPage, toLeft){
        
        // Изменение положения новой и старой текущей страницы
        newCurrPage.style.left = 0;
        // currPage.style.left = toLeft ? '-100%' : '100%' ;
        
        // Изменение индекся текущей страницы
        toLeft ? currPageIndex++ : currPageIndex--;
        if(currPageIndex >= pages.length){
            currPageIndex = 0;
        }
        if(currPageIndex < 0){
            currPageIndex = pages.length - 1;
        }

        // Обновление пипс. Включение той, что соответствует номеру страницы
        pipsUpdate();
        
        // Выключение кнопок до момента завершения анимации
        toggleButtons([buttonLeft, buttonRight]);
        
        currPage.remove();
        oldPrevPage.remove();
        
        setTimeout(() => {
            getPagesReadyToSwap();
            toggleButtons([buttonLeft, buttonRight]);
        }, BUTTON_SWAP_COOLDOWN);

        console.log(currPageIndex);
        currPage = newCurrPage;
        console.log('currpage:', currPage, 'nextpage:', nextPage, 'nextCurrpage:', newCurrPage, 'oldPrevPage', oldPrevPage);
    }
    
    
    
    // Прослушиватели событий для кнопок
    buttonRight.addEventListener('click', () => {
        swapPages(nextPage,prevPage, true);
    });

    buttonLeft.addEventListener('click', () => {
        swapPages(prevPage, nextPage, false);
    });
    
    mediaStreamButton.addEventListener('click', startPicInPic);
    
    // onLoad
    spawnPipsCircles();
    pipsUpdate();

    getPagesReadyToSwap();
});