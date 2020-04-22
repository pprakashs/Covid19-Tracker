
import Chart from 'chart.js';

class Covid19 {
    constructor(DOMElement, theme, timeout, country, color) {
        this.DOMElement = DOMElement
        this.theme = theme || card; // ['card', 'bar-chart', line-chart]
        this.timeout = timeout || 30;
        this.country = country;
        this.color = color ? color.split(', ') : ['#F4C363', '#60BB69', '#767676'];
        this.apiPath = 'https://covid19.mathdro.id/api';
        this.apiPathCountry = 'https://corona-api.com/countries';
    }

    //formatting the number
    formatNumber(num) {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    //fetching the data using API
    async fetchData() {
        let url, res;
        //checking if global or not
        if (this.country === 'global' && this.theme === "bar-chart") {
            url = this.apiPath
        } else if (this.country === 'global' && this.theme === "card") {
            url = this.apiPath
        } else if (this.country === 'global' && this.theme === "line-chart") {
            url = `${this.apiPath}/daily`
        } else {
            url = `${this.apiPathCountry}/${this.country}`
        }

        const req = await fetch(url);

        if (this.country !== 'global') {
            const { data } = await req.json();
            res = {
                name: data.name,
                latest_data: data.latest_data,
                timeline: data.timeline
            }
        } else {
            res = await req.json();
        }
        return res;

    }

    //creating chart setting
    chartSetting(ctx, data, name, type) {
        let chartType, chartData, options, cases, confirmed, recovered, deaths, countryName = name;

        if (this.country === 'global' && this.theme === 'line-chart') {
            cases = data;
        } else if (this.country === 'global') {
            confirmed = data.confirmed.value
            recovered = data.recovered.value
            deaths = data.deaths.value
        } else {
            //short cases by date
            cases = data.timeline.sort(function (a, b) {
                var dateA = new Date(a.date), dateB = new Date(b.date);
                return dateA - dateB;
            });
            confirmed = data.latest_data.confirmed
            recovered = data.latest_data.recovered
            deaths = data.latest_data.deaths

            countryName = data.name
        }
        type === 'bar-chart' ? chartType = 'bar' : chartType = 'line'
        // const { confirmed, recovered, deaths } = data;
        if (this.theme === 'bar-chart') {
            chartData = {
                labels: [`Confirmed ${this.formatNumber(confirmed)}`, `Recovered ${this.formatNumber(recovered)}`, `Death ${this.formatNumber(deaths)}`],
                datasets: [{
                    label: 'People',
                    data: [confirmed, recovered, deaths],
                    borderWidth: 1,
                    backgroundColor: [this.color[0], this.color[1], this.color[2]]
                }]
            }
            options = {
                maintainAspectRatio: true,
                responsive: true,
                legend: false,
                title: {
                    display: false,
                },
            }
        } else {
            chartData = {
                labels: cases.map((el) => {
                    if (this.country === 'global' && this.theme === 'line-chart') {
                        return el.reportDate
                    } else {
                        return el.date
                    }
                }),
                datasets: [
                    {
                        label: 'Infected',
                        backgroundColor: this.color[0],
                        borderColor: this.color[0],
                        data: cases.map((el) => {
                            if (this.country === 'global' && this.theme === 'line-chart') {
                                return el.confirmed.total
                            } else {
                                return el.confirmed
                            }
                        }),
                        fill: false,
                    },
                    {
                        label: 'Recovered',
                        backgroundColor: this.color[1],
                        borderColor: this.color[1],
                        data: cases.map((el) => {
                            if (this.country === 'global' && this.theme === 'line-chart') {
                                return el.recovered.total
                            } else {
                                return el.recovered
                            }
                        }),
                        fill: false,
                    },
                    {
                        label: 'Death',
                        backgroundColor: this.color[2],
                        borderColor: this.color[2],
                        data: cases.map((el) => {
                            if (this.country === 'global' && this.theme === 'line-chart') {
                                return el.deaths.total
                            } else {
                                return el.deaths
                            }
                        }),
                        fill: false,
                    },
                ],
            }

            options = {
                maintainAspectRatio: true,
                responsive: true,
                title: {
                    display: false,
                },
            }
        }

        new Chart(ctx, {
            type: chartType,
            data: chartData,
            options
        });
    }

    //creating UI
    createUI(data, name) {
        let output;
        if (this.country === 'global' && this.theme === 'card') {
            const { confirmed, recovered, deaths } = data
            // card ui
            output = `<div class="covid19-text-center">
            <div class="covid19-columns">
                <div class="covid19-column">
                    <h4 class="text-primary h4" style="color:${this.color[0]}!important">Confirmed</h4>
                    <h5 class="text-primary h1" style="color:${this.color[0]}!important">${this.formatNumber(confirmed.value)}</h5>
                </div>
                <div class="covid19-column">
                    <h4 class="text-success h4" style="color:${this.color[1]}!important">Recovered</h4>
                    <h5 class="text-success h1" style="color:${this.color[1]}!important">${this.formatNumber(recovered.value)}</h5>
                </div>
                <div class="covid19-column">
                    <h4 class="text-error h4" style="color:${this.color[2]}!important">Deaths</h4>
                    <h5 class="text-error h1" style="color:${this.color[2]}!important">${this.formatNumber(deaths.value)}</h5>
                </div>
            </div></div>`;
        } else if (this.country !== 'global' && this.theme === 'card') {
            const { latest_data: { confirmed, recovered, deaths } } = data
            // card ui
            output = `<div class="covid19-text-center">
            <div class="covid19-columns">
                <div class="covid19-column">
                <h4 class="text-primary h4" style="color:${this.color[0]}!important">Confirmed</h4>
                    <h5 class="text-primary h1" style="color:${this.color[0]}!important">${this.formatNumber(confirmed)}</h5>
                </div>
                <div class="covid19-column">
                    <h4 class="text-success h4" style="color:${this.color[1]}!important">Recovered</h4>
                    <h5 class="text-success h1" style="color:${this.color[1]}!important">${this.formatNumber(recovered)}</h5>
                </div>
                <div class="covid19-column">
                    <h4 class="text-error h4" style="color:${this.color[2]}!important">Deaths</h4>
                    <h5 class="text-error h1" style="color:${this.color[2]}!important">${this.formatNumber(deaths)}</h5>
                </div>
            </div></div>`;
        } else if (this.country === 'global' && this.theme === 'bar-chart') {
            const createCanvas = document.createElement('canvas');
            createCanvas.className = "covid19-chart";

            const markup = document.createElement('div');
            markup.className = "container col-9 text-center";
            markup.appendChild(createCanvas)

            this.chartSetting(createCanvas, data, name, this.theme);

            output = this.DOMElement.appendChild(markup);
        }
        else {
            const createCanvas = document.createElement('canvas');
            createCanvas.className = "covid19-chart";

            const markup = document.createElement('div');
            markup.className = "text-center";
            markup.appendChild(createCanvas)

            this.chartSetting(createCanvas, data, name, this.theme);

            output = this.DOMElement.appendChild(markup);
        }

        return output
    }

    //set the ui
    setUI(data, name) {
        // setting element to DOM
        if (this.theme === 'card') {
            this.DOMElement.insertAdjacentHTML('afterbegin', this.createUI(data, name))
        } else {
            this.createUI(data, name)
        }
    }

    //set the data
    async setData() {
        const data = await this.fetchData();
        let name
        this.country === 'global' ? name = 'Global' : name = this.country
        this.setUI(data, name)
    }

    get init() {
        //setting timeout value for interval 
        let time = this.timeout;
        time < 15 ? time = 15 : time = time;
        const timeout = time * 60 * 1000;

        //setting timeout
        setInterval(this.setData(), timeout);
    }

}

document.addEventListener('DOMContentLoaded', e => {
    //get the main DOM element
    const element = document.querySelectorAll('.covid19-wdiget-tracker');

    element.forEach(el => {
        //getting value from data attributes
        const theme = el.getAttribute('data-theme');
        const timeout = el.getAttribute('data-timeout');
        const country = el.getAttribute('data-country');
        const color = el.getAttribute('data-color');

        const Covid = new Covid19(el, theme, timeout, country, color);

        //init
        Covid.init;
    });
})


