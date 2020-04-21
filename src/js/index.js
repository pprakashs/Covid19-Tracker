
import Chart from 'chart.js';

class Covid19 {
    constructor(DOMElement, theme = 'card', timeout = 15, country) {
        this.theme = theme; // ['card', 'bar-chart', line-chart]
        this.timeout = timeout;
        this.country = country
        this.apiPath = 'https://covid19.mathdro.id/api';
        this.apiPathCountry = 'https://corona-api.com/countries';
        this.DOMElement = DOMElement
    }

    //formatting the number
    formatNumber(num) {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    //fetching the data using API
    async fetchData() {
        let url;
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
            const res = {
                name: data.name,
                latest_data: data.latest_data,
                timeline: data.timeline
            }
            return res
        } else {
            const data = await req.json();
            return data
        }
    }

    //creating chart setting
    chartSetting(ctx, data, name, type) {
        let chartType, chartData, options, cases, confirmed, recovered, deaths;

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
                    backgroundColor: ['rgb(244, 195, 99)', 'rgb(96, 187, 105)', 'rgb(118, 118, 118)']
                }]
            }
            options = {
                maintainAspectRatio: true,
                responsive: true,
                legend: false,
                title: {
                    display: true,
                    text: `${name.toUpperCase()} Chart`,
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
                        backgroundColor: 'rgb(244, 195, 99)',
                        borderColor: 'rgb(244, 195, 99)',
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
                        backgroundColor: 'rgb(96, 187, 105)',
                        borderColor: 'rgb(96, 187, 105)',
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
                        backgroundColor: 'rgb(118, 118, 118)',
                        borderColor: 'rgb(118, 118, 118)',
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
                    display: true,
                    text: `${name.toUpperCase()} Chart`,
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
            output = `<div class="container col-9 text-center">
            <h4 class="text-uppercase h5">${name}</h4>
            <div class="columns">
                <div class="column col-sm-12">
                    <h5 class="text-primary h4">Confirmed</h5>
                    <h5 class="text-primary h1">${this.formatNumber(confirmed.value)}</h5>
                </div>
                <div class="column col-sm-12">
                    <h5 class="text-success h4">Recovered</h5>
                    <h5 class="text-success h1">${this.formatNumber(recovered.value)}</h5>
                </div>
                <div class="column col-sm-12">
                    <h5 class="text-error h4">Deaths</h5>
                    <h5 class="text-error h1">${this.formatNumber(deaths.value)}</h5>
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
            markup.className = "container col-9 text-center";
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

        const Covid = new Covid19(el, theme, timeout, country);

        //init
        Covid.init;
    });
})


