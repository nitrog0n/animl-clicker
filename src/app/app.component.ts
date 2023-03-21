import { formatNumber } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface Animl {
  clicks: number,
  src: string
}

interface State {
  animlClicks: number,
  animlz: BehaviorSubject<Animl[]>,
  selectedAniml: Animl | null,
  selectedAnimlDegrees: number,
  isAutoClickerOn: boolean,
  autoClickerInterval: number,
  levels: number[],
  query: string,
  autoClickers: number
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  selectableAnimlz = [
    'kittens',
    'puppies',
    'pygmy monkeys',
    'racoons',
    'parrots',
    'hippos',
    'dinosaurs',
    'pandas',
    'frogs',
  ];

  state: State = {
    // How many times the main animl has been clicked
    // Get from local storage or default to 0
    animlClicks: Number(window.localStorage.getItem('animlClicks')) || 0,

    // List of animlz to display from the API
    animlz: new BehaviorSubject<Animl[]>([]),

    // Which animl is selected
    selectedAniml: null,
    selectedAnimlDegrees: 0,

    // Is the auto clicker turned on?
    isAutoClickerOn: false,
    autoClickerInterval: 0,

    // Clicks needed to unlock certain animlz
    levels: [
      0, 100, 250, 500, 1_000, 2_500, 5_000, 20_000, 50_000, 100_000, 500_000,
      1_000_000, 5_000_000, 10_000_000,
    ],

    query: '',

    autoClickers: 0,
  };

  magicButtonAnimlAmount = 100_000_000_000_000;

  constructor(private http: HttpClient) {
    this.getAnimlz(this.selectableAnimlz[0]);

    window.addEventListener('keydown', (event) => {
      if (event.key === 'End') {
        event.preventDefault();
        window.alert(
          `Congrats on finding the magic button! Here is ${formatNumber(
            this.magicButtonAnimlAmount,
            'en-US'
          )} ${this.state.query}!!!!!!!!!!!`
        );
        window.localStorage.setItem(
          'animlClicks',
          String((this.state.animlClicks += this.magicButtonAnimlAmount))
        );
      }
    });
  }

  getAnimlz(animlQuery: string) {
    // Make request to API with animl query
    this.http
      .get(
        `https://api.pexels.com/v1/search?query=${animlQuery}&per_page=${this.state.levels.length}`,
        {
          headers: {
            Authorization:
              '563492ad6f9170000100000100bd5556098040289326e00ab51d2f86',
          },
        }
      )
      .subscribe((response: any) => {
        // Loop through the levels and set the animlz and the clicks needed to unlock
        this.state.animlz.next(
          this.state.levels.reduce((base, curr, indx) => {
            return base.concat({
              clicks: curr,
              src: response.photos[indx].src.original,
            });
          }, [] as Animl[])
        );

        // set the default animl
        this.state.selectedAniml = Object.assign(this.state.animlz.value[0]);

        // set the new query
        this.state.query = animlQuery;
      });
  }

  onSelectedAnimlClick(element: HTMLDivElement) {
    // Increase the animl clicks by 5 and set to local storage
    window.localStorage.setItem(
      'animlClicks',
      String((this.state.animlClicks += 5))
    );

    // Rotate the image and minimize size
    element.style.width = '150px';
    element.style.height = '150px';
    element.style.transform = `rotate(${(this.state.selectedAnimlDegrees += 360)}deg)`;

    // After half a second, restore image size
    setTimeout(() => {
      element.style.width = '300px';
      element.style.height = '300px';
    }, 500);
  }

  changeSelectedAniml(animl: Animl) {
    // If the necesarry clicks is less than or equal to the current clicks
    // set the selected animl
    if (animl.clicks <= this.state.animlClicks) {
      this.state.selectedAniml = Object.assign(animl);
    }
  }

  onAnimlChange(event: any) {
    this.getAnimlz(event.target.value);
  }

  toggleAutoClicker(element: HTMLDivElement) {
    if (this.state.isAutoClickerOn) {
      this.state.isAutoClickerOn = false;
      window.clearInterval(this.state.autoClickerInterval);
    } else {
      this.state.isAutoClickerOn = true;
      this.state.autoClickerInterval = window.setInterval(() => {
        element.click();
      }, 100);
    }
  }

  reset() {
    window.localStorage.setItem(
      'animlClicks',
      String((this.state.animlClicks = 0))
    );
  }

  addAutoClicker() {
    this.state.autoClickers += 1;
    this.state.animlClicks -= 500;
  }
}