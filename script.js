/* ============================================
   API Configuration
   ============================================ */
const apiUrl = 'https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=ISL&sta=HFC&lang=TC';
const currentWeatherUrl = 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=tc';

/* ============================================
   Train Data Functions
   ============================================ */
async function fetchTrainData() {
    try {
        const response = await fetch(apiUrl);
        const json = await response.json();

        const upTbody = document.getElementById('up-tbody');
        const downTbody = document.getElementById('down-tbody');
        const errorDiv = document.getElementById('error-message');
        const updateP = document.getElementById('update-time');

        upTbody.innerHTML = '';
        downTbody.innerHTML = '';
        errorDiv.innerHTML = '';

        if (json.status === 0) {
            errorDiv.textContent = json.message || '無法獲取資料。可能是目前沒有列車服務或輸入錯誤。';
            return;
        }

        const key = 'ISL-HFC';
        const data = json.data[key];

        if (!data) {
            errorDiv.textContent = '無法找到車站資料。';
            return;
        }

        const currentTimeStr = json.curr_time || json.sys_time;
        const currentTime = new Date(currentTimeStr);
        updateP.textContent = `最後更新: ${currentTimeStr}`;
        window.lastTrainUpdate = Date.now();

        function formatTime(timeStr) {
            if (!timeStr) return '';
            const timeMatch = timeStr.match(/\d{2}:\d{2}:\d{2}/);
            return timeMatch ? timeMatch[0] : timeStr;
        }

        function calculateMins(arrivalTimeStr) {
            try {
                const arrivalTime = new Date(arrivalTimeStr);
                if (isNaN(arrivalTime) || isNaN(currentTime)) {
                    return '-';
                }
                const diffMs = arrivalTime - currentTime;
                if (diffMs < 0) {
                    return '已到達';
                }
                const mins = Math.floor(diffMs / 60000);
                return mins === 0 ? '即將抵達' : `${mins} 分鐘`;
            } catch (e) {
                return '-';
            }
        }

        if (data.UP && data.UP.length > 0) {
            data.UP.forEach(train => {
                const mins = calculateMins(train.time);
                const formattedTime = formatTime(train.time);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${train.seq}</td>
                    <td>${formattedTime}</td>
                    <td>${mins}</td>
                `;
                upTbody.appendChild(row);
            });
        } else {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="3">目前沒有上行列車資訊</td>';
            upTbody.appendChild(row);
        }

        if (data.DOWN && data.DOWN.length > 0) {
            data.DOWN.forEach(train => {
                const mins = calculateMins(train.time);
                const formattedTime = formatTime(train.time);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${train.seq}</td>
                    <td>${formattedTime}</td>
                    <td>${mins}</td>
                `;
                downTbody.appendChild(row);
            });
        } else {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="3">目前沒有下行列車資訊</td>';
            downTbody.appendChild(row);
        }

    } catch (error) {
        document.getElementById('error-message').textContent = '發生錯誤: ' + error.message;
    }
}

/* ============================================
   Weather Data Functions
   ============================================ */
function getWeatherIcon(iconCode) {
    // HKO Weather Icon Codes - based on official HKO documentation
    const iconMap = {
        '50': '☀️', // Sunny
        '51': '🌤️', // Sunny Periods
        '52': '⛅', // Sunny Intervals
        '53': '🌥️', // Sunny Periods with A Few Showers
        '54': '🌦️', // Sunny Intervals with Showers
        '60': '☁️', // Cloudy
        '61': '☁️', // Overcast
        '62': '🌧️', // Light Rain
        '63': '🌧️', // Rain
        '64': '⛈️', // Heavy Rain
        '65': '⛈️', // Thunderstorms
        '70': '☀️', // Fine
        '71': '🌙', // Fine (Night)
        '72': '💨', // Windy
        '73': '🌫️', // Fog
        '74': '🌫️', // Mist
        '75': '🌫️', // Haze
        '76': '☀️', // Hot (use sun icon)
        '77': '☀️', // Very Hot (use sun icon instead of thermometer)
        '80': '🌧️', // Light Rain
        '81': '🌧️', // Rain
        '82': '⛈️', // Heavy Rain
        '85': '❄️', // Snow
        '90': '☀️', // Hot (use sun icon)
        '91': '☁️', // Cold (use cloud icon)
        '92': '☀️', // Very Hot (use sun icon)
        '93': '☁️', // Very Cold (use cloud icon)
    };
    const codeStr = String(iconCode);
    const icon = iconMap[codeStr];
    
    // Debug: log the icon code being used
    if (!icon) {
        console.log('Unknown weather icon code:', iconCode);
    }
    
    return icon || '🌤️';
}

function getWeatherDescription(iconCode) {
    // Map icon codes to weather descriptions in Traditional Chinese
    const descMap = {
        '50': '晴天',
        '51': '間中有陽光',
        '52': '間中有陽光',
        '53': '間中有陽光，有幾陣驟雨',
        '54': '間中有陽光，有驟雨',
        '60': '多雲',
        '61': '密雲',
        '62': '微雨',
        '63': '有雨',
        '64': '大雨',
        '65': '雷暴',
        '70': '天晴',
        '71': '天晴',
        '72': '有風',
        '73': '有霧',
        '74': '有薄霧',
        '75': '有煙霞',
        '76': '炎熱',
        '77': '非常炎熱',
        '80': '微雨',
        '81': '有雨',
        '82': '大雨',
        '85': '有雪',
        '90': '炎熱',
        '91': '寒冷',
        '92': '非常炎熱',
        '93': '非常寒冷',
    };
    return descMap[String(iconCode)] || '';
}

async function fetchWeatherData() {
    try {
        const weatherDiv = document.getElementById('weather-info');
        const weatherError = document.getElementById('weather-error');

        weatherDiv.innerHTML = '';
        weatherError.innerHTML = '';

        const currentResponse = await fetch(currentWeatherUrl);
        const currentData = await currentResponse.json();

        if (currentData && currentData.temperature) {
            const temp = currentData.temperature.data[0];
            const humidity = currentData.humidity ? currentData.humidity.data[0] : null;

            let weatherIcon = '🌤️';
            let weatherDesc = '';
            let iconCode = null;
            
            // Debug: log the API response to see what we're getting
            console.log('Weather API Response:', currentData);
            
            if (currentData.icon && currentData.icon.length > 0) {
                iconCode = currentData.icon[0];
                console.log('Icon code from API:', iconCode);
                weatherIcon = getWeatherIcon(iconCode);
            } else if (currentData.forecastIcon) {
                iconCode = currentData.forecastIcon;
                console.log('Forecast icon code from API:', iconCode);
                weatherIcon = getWeatherIcon(iconCode);
            } else {
                console.log('No icon data found in API response');
            }

            // Try multiple fields for weather description
            if (currentData.weather && currentData.weather.length > 0) {
                weatherDesc = currentData.weather[0];
            } else if (currentData.weatherDesc) {
                weatherDesc = currentData.weatherDesc;
            } else if (currentData.weatherInfo) {
                weatherDesc = currentData.weatherInfo;
            } else if (currentData.forecastWeather) {
                weatherDesc = currentData.forecastWeather;
            } else if (iconCode !== null) {
                // Use icon code to get description as fallback
                weatherDesc = getWeatherDescription(iconCode);
            }

            // Determine what to show in the third line
            let rainfallInfo = '';
            if (currentData.rainfall && currentData.rainfall.data && currentData.rainfall.data.length > 0) {
                const rainfallData = currentData.rainfall.data;
                let maxRainfall = 0;
                rainfallData.forEach(item => {
                    const rainValue = item.max || item.value || 0;
                    if (rainValue > maxRainfall) {
                        maxRainfall = rainValue;
                    }
                });

                if (maxRainfall > 0) {
                    rainfallInfo = `降雨: ${maxRainfall} 毫米`;
                } else {
                    // No rain, show weather description
                    rainfallInfo = weatherDesc || '無降雨';
                }
            } else {
                // No rainfall data, show weather description
                rainfallInfo = weatherDesc || '無降雨';
            }

            const currentCard = document.createElement('div');
            currentCard.className = 'weather-card current-weather';
            currentCard.innerHTML = `
                <div class="weather-info-container">
                    <div class="weather-info-text">
                        <p><strong>溫度:</strong> ${temp.value}°C</p>
                        ${humidity ? `<p><strong>濕度:</strong> ${humidity.value}%</p>` : ''}
                        <p><strong>${rainfallInfo}</strong></p>
                    </div>
                    <div class="weather-icon-display">
                        ${weatherIcon}
                    </div>
                </div>
            `;
            weatherDiv.appendChild(currentCard);
        } else {
            weatherError.textContent = '無法獲取天氣資料。';
        }

    } catch (error) {
        document.getElementById('weather-error').textContent = '發生錯誤: ' + error.message;
    }
}

/* ============================================
   UI Update Functions
   ============================================ */
function updateDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');

    const dateTimeStr = `${year}年${month}月${day}日 ${hour}時${minute}分${second}秒`;
    document.getElementById('current-datetime').textContent = dateTimeStr;
}

function updateRefreshCountdown() {
    const countdownDiv = document.getElementById('refresh-countdown');
    if (!countdownDiv) return;

    const now = Date.now();
    const trainRefreshInterval = 30000;
    const weatherRefreshInterval = 300000;

    if (window.lastTrainUpdate) {
        const timeSinceTrainUpdate = now - window.lastTrainUpdate;
        const timeUntilTrainRefresh = trainRefreshInterval - timeSinceTrainUpdate;

        if (timeUntilTrainRefresh > 0) {
            const seconds = Math.ceil(timeUntilTrainRefresh / 1000);
            countdownDiv.textContent = `下次更新: ${seconds} 秒`;
        } else {
            countdownDiv.textContent = '更新中...';
        }
    }
}

/* ============================================
   Initialization
   ============================================ */
updateDateTime();
setInterval(updateDateTime, 1000);

setInterval(updateRefreshCountdown, 1000);

fetchTrainData();
fetchWeatherData();

setInterval(fetchTrainData, 30000);
setInterval(fetchWeatherData, 300000);

