import { Component, OnInit } from '@angular/core';
// import Spotlight from "spotlight.js";

interface IImage {
  src: string;
  description: string;
}

@Component({
  selector: 'app-help-page',
  templateUrl: './help-page.component.html',
  styleUrls: ['./help-page.component.scss']
})
export class HelpPageComponent implements OnInit {

  public imgdescription = 'data-description';

  public startGame: IImage[] = [
    {
      description: 'Для того чтобы создать новую игру, нажмите на кнопку «Создать игру».',
      src: '/assets/help/create_game_1.png'
    },
    {
      description: 'Заполните поля «Название» и «Тип карты», после чего нажмите кнопку «Создать».',
      src: '/assets/help/create_game_2.png'
    },
    {
      description: 'Чтобы присоединится к уже созданной игре, нужно нажать на кнопку «Присоединиться». В открывшемся окне выбрать название игры для того чтобы присоединиться к ней.',
      src: '/assets/help/create_game_4.png'
    },
    {
      description: 'Только что созданная игра будет в статусе «Ожидание». К ней может присоединиться любой участник.',
      src: '/assets/help/create_game_3.png'
    },
    {
      description: 'После того, как все участники присоединились к игре. Создатель игры может нажать кнопку «Начать». После этого к игре могут присоединиться только те игроки, которые числятся в списке участников.',
      src: '/assets/help/create_game_5.png'
    },
  ];

  constructor() { }

  ngOnInit() {
  }

}
