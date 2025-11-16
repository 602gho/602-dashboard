# TODO: Modify Layout for Train and Weather Sections

## Steps to Complete
- [x] Wrap train-section and weather-section in a new div with class "main-content"
- [x] Add CSS for .main-content: display flex, flex-direction row, with gap
- [x] Add media query for max-width: 768px to set flex-direction: column (preserve mobile layout)
- [x] Add media query for min-width: 769px to reduce font sizes in sections for larger screens
- [x] Test the layout on different screen sizes (opened in browser)
- [x] Adjust flex ratios: train-section flex: 2, weather-section flex: 1 for wider train section
- [x] Re-test layout after adjustments
- [x] Move forecast grid to a separate full-width section below train and weather sections
- [x] Add CSS for .forecast-section with appropriate styling
- [x] Test the new layout to ensure all content fits on TV aspect ratio
- [x] Make "天氣預報" font size the same as "杏花邨列車抵達時間" and "天氣資訊"
- [x] Make class="current-weather-section" the same height as class="direction" by adding align-items: stretch to .main-content
- [x] Adjust font size of "天氣預報" to match "杏花邨列車抵達時間" (h1 size)
- [x] Optimize layout to fit within 1920x1080 without scrolling: reduce body padding, section margins, and adjust font sizes for larger screens
