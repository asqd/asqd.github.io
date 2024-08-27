const COLLECTION_OPTIONS = {
  // Количество элементов на странице
  totalItemsPerPage: 15,
  // Размеры сетки
  gridCols: 3,
  gridRows: 5,
  // Размер элементов
  itemWidth: 150,
  itemHeight: 150,
  // Отступы между элементами
  itemSpacingX: 60,
  itemSpacingY: 30,
  startX: 80,
  startY: 80,
}

const DEFAULT_COLLECTION_NAME = 'animals'

const COLLECTIONS = {
  animals: {
    frameConfig: { frameWidth: 48, frameHeight: 60, margin: 0, spacing: 0 },
    itemProps: [
      {
        title: 'Кошка'
      },
      {
        title: 'Собака'
      },
      {
        title: 'Енот'
      },
      {
        title: 'Попугай'
      },
      {
        title: 'Пингвин'
      },
      {
        title: 'Обезьяна'
      },
      {
        title: 'Мышь'
      },
      {
        title: 'Ёжик'
      },
      {
        title: 'Тюлень'
      },
      {
        title: 'Гусь'
      },
      {
        title: 'Змея'
      },
      {
        title: 'Панда'
      },
      {
        title: 'Лиса'
      },
      {
        title: 'Леопард'
      },
      {
        title: 'Бобёр'
      },
      {
        title: 'Свинья'
      },
      {
        title: 'Филин'
      },
      {
        title: 'Хамелеон'
      },
      {
        title: 'Овца'
      },
      {
        title: 'Петух'
      },
      {
        title: 'Ленивец'
      },
      {
        title: 'Медведь?'
      },
      {
        title: 'Заяц'
      },
      {
        title: 'Черепаха'
      },
      {
        title: 'Бегемот'
      },
      {
        title: 'Капибара'
      },
      {
        title: 'Корова'
      },
      {
        title: 'Осьминог'
      },
      {
        title: 'Павлин'
      },
      {
        title: 'Носорог'
      },
    ]
  },
  origami_animals: {
    frameConfig: { frameWidth: 256, frameHeight: 256, margin: 0, spacing: 0 },
    itemProps: [
      {
        title: 'Динозавр'
      },
      {
        title: 'Кошка'
      },
      {
        title: 'Слон'
      },
      {
        title: 'Рыба'
      },
      {
        title: 'Журавль'
      },
      {
        title: 'Утка'
      },
      {
        title: 'Колибри'
      },
      {
        title: 'Единорог'
      },
      {
        title: 'Собака'
      },
      {
        title: 'Лягушка'
      },
      {
        title: 'Кораблик'
      },
      {
        title: 'Дракон'
      },
    ]
  }
}

