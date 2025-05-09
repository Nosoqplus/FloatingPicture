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
    
    const BUTTON_SWAP_COOLDOWN = 500;
    
    let currPage;
    let nextPage;
    let prevPage;
    let currPageIndex = 0;
    console.log(pages, pagesCircles, buttonLeft, buttonRight, contentDiv);
    
    // Starts Picture in Picture
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
    
    // Page Swap
    function spawnPageCircles(){
        const pageCircleContainer = document.querySelector('.page-circle-container');
        pages.forEach(() =>{
            circle = document.createElement('div');
            circle.classList.add('page-circle');

            pageCircleContainer.appendChild(circle);
            pagesCircles.push(circle);
        });
    }

    function getPagesReadyToSwap(){
        if(!currPage){
            currPage = pages[currPageIndex].cloneNode(true);
        }
        nextPage = pages[currPageIndex >= pages.length - 1 ? 0 : currPageIndex + 1 ].cloneNode(true);
        prevPage = pages[currPageIndex <= 0 ? pages.length - 1 : currPageIndex - 1 ].cloneNode(true);
        
        contentDiv.appendChild(currPage);
        contentDiv.appendChild(nextPage);
        contentDiv.appendChild(prevPage);
        
        currPage.style.left = 0;
        nextPage.style.left = '100%';
        prevPage.style.left = '-100%';
        
        console.log(prevPage, currPage, nextPage, currPageIndex);
        PageCirclesUpdate();
    }
    
    function PageCirclesUpdate(){
        pagesCircles.forEach((circle) => {
            circle.classList.remove('active');
        })

        pagesCircles[currPageIndex].classList.add('active');
    };

    function toggleButtons(){
        buttonLeft.disabled = !buttonLeft.disabled;
        buttonRight.disabled = !buttonRight.disabled;
    }

    buttonRight.addEventListener('click', () => {

        currPage.style.left = '-100%';
        nextPage.style.left = 0;

        
        currPageIndex++;
        if(currPageIndex >= pages.length){
            currPageIndex = 0;
        }
        toggleButtons()
        
        setTimeout(
            () => {
                currPage.remove();
                prevPage.remove();
                getPagesReadyToSwap();
                toggleButtons();
            },
            BUTTON_SWAP_COOLDOWN
        );
        currPage = nextPage;
        
    });
    buttonLeft.addEventListener('click', () => {
        
        currPage.style.left = '+100%';
        prevPage.style.left = 0;
        
        
        if(currPageIndex === 0){
            currPageIndex = pages.length - 1;
        } else {
            currPageIndex--;
        }
        toggleButtons();
        
        setTimeout(
            () => {
                currPage.remove();
                nextPage.remove();
                getPagesReadyToSwap();
                toggleButtons();
            },
            BUTTON_SWAP_COOLDOWN
        );
        currPage = prevPage;
        
    });


    // onLoad
    mediaStreamButton.addEventListener('click', startPicInPic);
    spawnPageCircles();
    getPagesReadyToSwap();
});