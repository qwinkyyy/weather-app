const apiKey = 'edc47f066906d78df1e44afdeef6f30b'; 

// Объект для сопоставления кодов иконок погоды с классами иконок
const weatherIconMap = {
    '01d': 'sun', 
    '01n': 'moon', 
    '02d': 'sun', 
    '02n': 'moon', 
    '03d': 'cloud', 
    '03n': 'cloud', 
    '04d': 'cloud', 
    '04n': 'cloud', 
    '09d': 'cloud-rain', 
    '09n': 'cloud-rain', 
    '10d': 'cloud-rain', 
    '10n': 'cloud-rain', 
    '11d': 'cloud-lightning', 
    '11n': 'cloud-lightning', 
    '13d': 'cloud-snow', 
    '13n': 'cloud-snow', 
    '50d': 'water', // Туман днем
    '50n': 'water' // Туман ночью
};

// Функция для получения данных о погоде
function fetchWeatherData(location) {
    let apiUrl; 

    // Определяем URL API в зависимости от типа параметра location (строка или объект с координатами)
    if (typeof location === 'string') {
        apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`; 
    } else if (typeof location === 'object') {
        apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric`; 
    }

    // Отправляем запрос к API и обрабатываем ответ
    fetch(apiUrl)
        .then(response => response.json()) // Преобразуем ответ в JSON
        .then(data => {
            if (data.list && data.list.length > 0) { // Проверяем наличие данных о погоде
                const todayWeather = data.list[0].weather[0].description; // Описание погоды на сегодня
                const todayTemperature = `${Math.round(data.list[0].main.temp)}°C`; // Температура на сегодня
                const todayWeatherIconCode = data.list[0].weather[0].icon; // Код иконки погоды на сегодня

                const todayInfo = document.querySelector('.today-info'); // Элемент для отображения сегодняшней информации
                const todayWeatherIcon = document.querySelector('.today-weather .bx'); // Элемент для отображения иконки погоды
                const todayTemp = document.querySelector('.today-weather .weather-temp'); // Элемент для отображения температуры

                // Проверяем наличие элементов и обновляем их содержимое
                if (todayInfo && todayWeatherIcon && todayTemp) {
                    todayInfo.querySelector('h2').textContent = new Date().toLocaleDateString('ru-RU', { weekday: 'long' }); // Обновляем день недели
                    todayInfo.querySelector('span').textContent = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }); // Обновляем дату
                    todayWeatherIcon.className = `bx bx-${weatherIconMap[todayWeatherIconCode]}`; // Обновляем иконку погоды
                    todayTemp.textContent = todayTemperature; 
                } else {
                    console.error('Некоторые элементы today-info не найдены'); 
                }

                const locationElement = document.querySelector('.today-info > div > span'); // Элемент для отображения местоположения
                const weatherDescriptionElement = document.querySelector('.today-weather > h3'); // Элемент для отображения описания погоды

                // Проверяем наличие элементов и обновляем их содержимое
                if (locationElement && weatherDescriptionElement) {
                    locationElement.textContent = `${data.city.name}, ${data.city.country}`; // Обновляем местоположение
                    weatherDescriptionElement.textContent = todayWeather; // Обновляем описание погоды
                } else {
                    console.error('Некоторые элементы left-info не найдены'); // Ошибка, если элементы не найдены
                }

                const todayPrecipitation = `${Math.round(data.list[0].pop * 100)} %`; // Вероятность осадков на сегодня
                const todayHumidity = `${data.list[0].main.humidity} %`; // Влажность на сегодня
                const todayWindSpeed = `${data.list[0].wind.speed} km/h`; // Скорость ветра на сегодня

                const dayInfoContainer = document.querySelector('.day-info'); // Элемент для отображения дополнительной информации о погоде

                // Проверяем наличие элемента и обновляем его содержимое
                if (dayInfoContainer) {
                    dayInfoContainer.innerHTML = `
                        <div>
                            <span class="title">АТМОСФЕРНЫЕ ОСАДКИ</span>
                            <span class="value">${todayPrecipitation}</span>
                        </div>
                        <div>
                            <span class="title">ВЛАЖНОСТЬ</span>
                            <span class="value">${todayHumidity}</span>
                        </div>
                        <div>
                            <span class="title">СКОРОСТЬ ВЕТРА</span>
                            <span class="value">${todayWindSpeed}</span>
                        </div>
                    `; 
                } else {
                    console.error('day-info элемент не найден'); 
                }

                const today = new Date(); // Текущая дата
                const nextDaysData = data.list.slice(1); // Данные о погоде на следующие дни
                const uniqueDays = new Set(); // Множество для уникальных дней
                let count = 0; // Счетчик уникальных дней
                const daysList = document.querySelector('.days-list'); // Элемент для отображения списка дней
                         
                // Проверяем наличие элемента и обновляем его содержимое
                if (daysList) {
                    daysList.innerHTML = ''; // Очищаем список дней
                    for (const dayData of nextDaysData) {
                        const forecastDate = new Date(dayData.dt_txt); // Дата прогноза
                        const dayAbbreviation = forecastDate.toLocaleDateString('ru-RU', { weekday: 'short' }); // Аббревиатура дня недели

                        // Фильтруем данные для конкретного дня
                        const dayTemperatures = nextDaysData.filter(data => {
                            const dataDate = new Date(data.dt_txt); // Дата данных
                            return dataDate.getDate() === forecastDate.getDate(); // Сравниваем даты
                        });

                        // Рассчитываем среднюю температуру за день
                        const avgTemp = dayTemperatures.reduce((acc, curr) => acc + curr.main.temp, 0) / dayTemperatures.length; // Средняя температура
                        const dayTemp = `${Math.round(avgTemp)}°C`; // Округленная температура
                        const iconCode = dayData.weather[0].icon; // Код иконки погоды

                        // Добавляем данные о дне в список, если день уникален и не является сегодняшним
                        if (!uniqueDays.has(dayAbbreviation) && forecastDate.getDate() !== today.getDate()) {
                            uniqueDays.add(dayAbbreviation); // Добавляем день в множество уникальных дней
                            daysList.innerHTML += `
                                <li>
                                    <i class='bx bx-${weatherIconMap[iconCode]}'></i>
                                    <span>${dayAbbreviation}</span>
                                    <span class='day-temp'>${dayTemp}</span>
                                </li>
                            `; 
                            count++; // Увеличиваем счетчик уникальных дней
                        }

                        // Прерываем цикл после добавления данных для 4 дней
                        if (count === 4) break; // Останавливаем цикл, если добавили 4 дня
                    }
                } else {
                    console.error('days-list элемент не найден'); 
                }
            } else {
                console.error('Некорректные данные из API:', data); 
                alert(`Ошибка при получении данных о погоде: Некорректные данные из API (Api Error)`); 
            }
        })
        .catch(error => {
            console.error(`Ошибка при получении данных о погоде: ${error}`); 
            alert(`Ошибка при получении данных о погоде: ${error} (Api Error)`); 
        });
}

// Функция для запроса текущего местоположения пользователя
function getCurrentLocationWeather() {
    navigator.geolocation.getCurrentPosition(
        position => {
            const lat = position.coords.latitude; // Широта текущего местоположения
            const lon = position.coords.longitude; // Долгота текущего местоположения
            fetchWeatherData({ lat, lon }); // Получаем данные о погоде для текущего местоположения
        },
        error => {
            console.error(`Ошибка при получении текущего местоположения: ${error.message}`); 
        }
    );
}

// Получение данных о погоде при загрузке документа для местоположения по умолчанию (Москва)
document.addEventListener('DOMContentLoaded', () => {
    getCurrentLocationWeather(); // Получаем данные для текущего местоположения при загрузке страницы

    const locButton = document.querySelector('.loc-button'); // Кнопка для ввода местоположения вручную
    const currentLocButton = document.querySelector('.current-loc-button'); // Кнопка для получения текущего местоположения

    // Обработка события клика на кнопку для ввода местоположения вручную
    locButton.addEventListener('click', () => {
        const location = prompt('Введите местоположение:'); // Запрос местоположения у пользователя
        if (!location) return; // Выход, если местоположение не введено
        fetchWeatherData(location); // Получаем данные о погоде для введенного местоположения
    });

    // Обработка события клика на кнопку для получения текущего местоположения
    currentLocButton.addEventListener('click', () => {
        getCurrentLocationWeather(); // Получаем данные для текущего местоположения при клике на кнопку
    });
});
