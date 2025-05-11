document.addEventListener('DOMContentLoaded', function(){
    // ТЖг шаблона
    const template = document.querySelector('template');

    // Переменные для PicInPic
    const mediaStreamButton = document.querySelector('.button-container button');
    const videoElement = document.querySelector('#main-video');
    
    // Переменные для перелистывания страниц
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
    
    // Переменные для работы с языками
    const langSelect = document.querySelector('select#lang-select');
    const languages = ['ru', 'en', 'fr', 'ita', 'jap'];

    // Кнопка для вкл/выкл инструкции
    const instrBtn = document.querySelector('#instruction-btn');
    const instrContainer = document.querySelector('.instruction-container');
    
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
    // Исполняется при нажатии на кнопки turnLeft и turnRught
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
        
        // Удаление ненужных страниц
        currPage.remove();
        oldPrevPage.remove();
        
        // Включение кнопок и создание новых страниц по таймеру
        setTimeout(() => {
            getPagesReadyToSwap();
            toggleButtons([buttonLeft, buttonRight]);
        }, BUTTON_SWAP_COOLDOWN);
        
        // Присваеваем новое значение переменной currpage
        currPage = newCurrPage;
    }
    
    
    // Смена языков

    // Добавляет хэш с аббревиатурой языка
    // Исполняется каждый раз при изенении значения в <select>
    function applyLangToURL() {
        // Добавление в URL страницы выбора пользователя
        location.hash = langSelect.value;
        
        // Перезагрузка страницы для исполнения функции changeLanguage
        location.reload();
    }
    
        // По сути, можно было бы отказаться от использования хэшей и брать значения из <select> напрямую,
        // Но тогда при перезагрузках страницы все всегда возвращалось бы к начальному значению,
        // Как и при пересылки между пользователями

    // Изменяет содержание элементов под выбранный язык
    // Исполняется при загрузке страницы
    function changeLanguage(){
        // Получение хэша страницы и перевода его в строковое значения языка
        hash = location.hash;
        lang = hash.substr(1);

        




        // Проверка, есть ли перевод такого языка
        if(languages.includes(lang)){
            // Изменяем <select> под выбранный язык
            langSelect.value = lang;


            // Перевод всех элементов на странице
            for(key in translateArr){
                let elem = document.querySelector('#' + key);
                if(elem){
                    elem.textContent = translateArr[key][lang]; 
                    console.log('translated:', elem);
                }
            
            // Перевод всех страниц из массива с страницами
            // Отдельно, потому что иначе до них не получиться достучаться обычным document.querySelector
            for(key in translateArr){
                let elem;
                pages.forEach((page) => {
                    elemToTransl = page.querySelector('#' + key);
                    if(elemToTransl){
                        elem = elemToTransl;
                    }
                });
                if(elem && translateArr[key][lang]){
                    elem.textContent = translateArr[key][lang]; 
                    console.log('translated:', elem);
                }
            }    
            }    

        }

    }    
    
    // Прослушиватели
    buttonRight.addEventListener('click', () => {
        swapPages(nextPage,prevPage, true);
    });

    buttonLeft.addEventListener('click', () => {
        swapPages(prevPage, nextPage, false);
    });
    
    mediaStreamButton.addEventListener('click', startPicInPic);

    langSelect.addEventListener('change', applyLangToURL);

    instrBtn.addEventListener('click', () => {instrContainer.hidden = !instrContainer.hidden});
    
    // onLoad
    spawnPipsCircles();
    pipsUpdate();

    changeLanguage();
    getPagesReadyToSwap();

});