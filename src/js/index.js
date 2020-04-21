
import Chart from 'chart.js';


class Covid19 {
    constructor(DOMElement, theme = 'card', timeout = 15, country) {
        this.theme = theme; // ['card', 'chart']
        this.timeout = timeout;
        this.country = country
        this.apiPath = 'https://covid19.mathdro.id/api';
        this.apiPathCountry = 'https://corona-api.com/countries';
        this.DOMElement = DOMElement
    }

    formatNumber(num) {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    async fetchData() {
        let url = this.apiPath;
        //checking if global or not
        this.country !== 'global' ? url = `${this.apiPathCountry}/${this.country}` : '';

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

    chartSetting(ctx, data, name, type) {
        let chartType, datas, options, cases, confirmed, recovered, deaths;

        if (this.country !== 'global') {

            //short cases by date
            cases = data.timeline.sort(function (a, b) {
                var dateA = new Date(a.date), dateB = new Date(b.date);
                return dateA - dateB;
            });
            confirmed = data.latest_data.confirmed
            recovered = data.latest_data.recovered
            deaths = data.latest_data.deaths
        } else {
            confirmed = data.confirmed.value
            recovered = data.recovered.value
            deaths = data.deaths.value
        }

        type === 'bar-chart' ? chartType = 'bar' : chartType = 'line'
        // const { confirmed, recovered, deaths } = data;
        if (this.theme === 'bar-chart') {
            datas = {
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
            datas = {
                labels: cases.map((el) => el.date),
                datasets: [
                    {
                        label: 'Infected',
                        backgroundColor: 'rgb(244, 195, 99)',
                        borderColor: 'rgb(244, 195, 99)',
                        data: cases.map((el) => el.confirmed),
                        fill: false,
                    },
                    {
                        label: 'Recovered',
                        backgroundColor: 'rgb(96, 187, 105)',
                        borderColor: 'rgb(96, 187, 105)',
                        data: cases.map((el) => el.recovered),
                        fill: false,
                    },
                    {
                        label: 'Death',
                        backgroundColor: 'rgb(118, 118, 118)',
                        borderColor: 'rgb(118, 118, 118)',
                        data: cases.map((el) => el.deaths),
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
            data: datas,
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

    setUI(data, name) {
        // setting element to DOM
        if (this.theme === 'card') {
            this.DOMElement.insertAdjacentHTML('afterbegin', this.createUI(data, name))
        } else {
            this.createUI(data, name)
        }
    }

    async setData() {
        const data = await this.fetchData();
        let name
        this.country === 'global' ? name = 'Global' : name = this.country
        this.setUI(data, name)

    }

    get init() {
        //setting timeout value for 
        let time = this.timeout;
        time < 15 ? time = 15 : time = time;
        const timeout = time * 60 * 1000;

        //setting timeout
        setInterval(this.setData(), timeout);
    }

}

document.addEventListener('DOMContentLoaded', async e => {
    //get the main DOM element
    const element = document.querySelectorAll('.covid19-wdiget-traker');

    element.forEach(el => {
        //getting value from data attributes
        const theme = el.getAttribute('data-theme');
        const timeout = el.getAttribute('data-timeout');
        const country = el.getAttribute('data-country');

        const covid = new Covid19(el, theme, timeout, country);

        //init
        covid.init;
    });
})


