# Voxel Sandbox

2D-песочница в стиле Terraria на HTML5 Canvas (vanilla JavaScript).

Графика: [Kenney Voxel Pack](https://kenney.nl/assets/voxel-pack) (CC0).

## Запуск

Нужен локальный HTTP-сервер (браузер не загрузит ассеты с `file://`):

```bash
npx serve .
```

или:

```bash
python -m http.server 8080
```

Откройте в браузере: `http://localhost:8080`

## Управление

| Клавиша | Действие |
|---------|----------|
| A / D | Движение |
| Space | Прыжок |
| ЛКМ | Копать блок |
| ПКМ | Поставить блок |
| 1–9 | Выбор слота хотбара |
| Колёсико | Переключение слота |

## Структура

- `index.html` — страница игры
- `css/style.css` — UI и хотбар
- `js/` — логика игры (мир, физика, рендер, инвентарь)
