const meals_container = document.getElementById("mealz");
const favMealz = document.getElementById("fav-meals");
const searchValue = document.getElementById("searchBar");
const searchBtn = document.getElementById("search");
const closeUpBtn = document.getElementById("closeUp");
const popUpContent = document.getElementById("popUp-info");
const mealInfoE1 = document.getElementById("meal-info");
async function getRandomMeal(){
    const response = await  fetch(
        "https://www.themealdb.com/api/json/v1/1/random.php"
        );
    const responseData = await response.json();
    const randomMeal = responseData.meals[0];
    addRandomMeal(randomMeal , true);
}

async function getSearchMeal(term){
   const resp = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + term);
   const respData = await resp.json();
   const meal = respData.meals;
   return meal;

}

async function getMealById(id) {
    const resp = await fetch(
        "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
    );

    const respData = await resp.json();
    const meal = respData.meals[0];

    return meal;
}
getRandomMeal();
fetchFavMeals();

function addRandomMeal(dataMeal , random = false){

    const meal = document.createElement('div');
    meal.classList.add('meals');
    meal.innerHTML = `
    <div class="meals-header">
        ${random 
        ? `<span class="random">random receipe</span>`
        : ""}
        <img src="${dataMeal.strMealThumb}" alt="${dataMeal.strMeal}"/> 
    </div>
    <div class="meals-body">
        <h1>${dataMeal.strMeal}</h1>
        <button class="fav-btn">
            <i class="fa-solid fa-heart"></i>
        </button>
    </div>`;
  

    const btn = meal.querySelector('.meals-body .fav-btn');
    btn.addEventListener("click" , () => {
        if(btn.classList.contains("active")){
            btn.classList.remove("active");
            removeMealsLS(dataMeal.idMeal);
        }
        else{
            btn.classList.add("active");
            addMealsLS(dataMeal.idMeal);
            
        }
        fetchFavMeals();
        
    });
    meals_container.appendChild(meal);
    const popupHead = document.querySelector(".meals-body h1");
    popupHead.addEventListener( "click", () =>{
        showPopUp(dataMeal);
    });
}

function removeMealsLS(mealId){
    const mealIds = getMealsLS();
    localStorage.setItem(
        "mealIds" , 
        JSON.stringify( mealIds.filter((id) => id !== mealId))
    );
}

function addMealsLS(mealId){
    const mealIds = getMealsLS();
    localStorage.setItem(
        "mealIds" , JSON.stringify( [...mealIds , mealId])
    );
}

function getMealsLS(){
    const mealIds = JSON.parse(localStorage.getItem("mealIds"));
    return mealIds === null ? [] : mealIds ;
}

async function fetchFavMeals() {
    // clean the container
     favMealz.innerHTML = "";

    const mealIds = getMealsLS();

    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        meal = await getMealById(mealId);
        addMealFav(meal);
    }
} 
 function addMealFav(mealData) {
        const favMeal = document.createElement("li");
    
        favMeal.innerHTML = `
            <img
                src="${mealData.strMealThumb}"
                alt="${mealData.strMeal}"
            /><span class="fav-name">${mealData.strMeal}</span>
            <button class="clear"><i class="fa-regular fa-circle-xmark"></i></button>
        `;

    const btnClear = favMeal.querySelector(".clear");
    btnClear.addEventListener('click' , () =>{
        removeMealsLS(mealData.idMeal);
        fetchFavMeals();
    });
    favMealz.appendChild(favMeal);
    const favPopUp = favMeal.querySelector(".fav-name");
    favPopUp.addEventListener( "click", () =>{
        showPopUp(mealData);
    });  

}

searchBtn.addEventListener( 'click', async () => {
    meals_container.innerHTML = '';
    const search = searchValue.value;
    const meals = await getSearchMeal(search);
    if(meals){
    meals.forEach( (add) => {
        addRandomMeal(add);
    });
   }
});

function showPopUp(mealData){

const mealEl= document.createElement('div');

mealInfoE1.innerHTML = "";

const ingredients = [];

// get ingredients and measures
for (let i = 1; i <= 20; i++) {
    if (mealData["strIngredient" + i]) {
        ingredients.push(
            `${mealData["strIngredient" + i]} - ${
                mealData["strMeasure" + i]
            }`
        );
    } else {
        break;
    }
}

mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}"
        />
        <p>
        ${mealData.strInstructions}
        </p>
        <h3>Ingredients :</h3>
        <ul>
            ${ingredients
                .map(
                    (ing) => `
            <li>${ing}</li>
            `
                )
                .join("")}
        </ul>
    `;

mealInfoE1.appendChild(mealEl);
popUpContent.classList.remove("hidden");

}

closeUpBtn.addEventListener('click' , () =>{
    popUpContent.classList.add("hidden");
});