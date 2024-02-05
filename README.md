
# Math-PDF-Generator-Web
Live web version of the Math PDF Generator I made in Python
 It allows you to generate any number of PDFs (limited by your hardware specs), each containing random math problems and corresponding answer key. The PDFs are then packaged into a zip file and downloaded to your device using jsZIP, jsPDF and FileSaver.js.

## Features

- Generate any number of PDFs
- Each PDF contains random math problems and answers
- PDFs are packaged into a zip file for easy download
- Works on both desktop and mobile devices
- Each PDF has 10 pages | 56-57KB

#### Example Question page
![image](https://github.com/sankeer28/Math-PDF-Generator-Web/assets/112449287/3ca07614-d136-4f90-be82-e966388ec95b)


#### Example Answer page
![image](https://github.com/sankeer28/Math-PDF-Generator-Web/assets/112449287/9406aaea-e355-4446-ad83-b778bd2a5e30)



## Usage
Visit [site](https://sankeer28.github.io/Math-PDF-Generator-Web/)
Simply enter the number of PDFs  you want to generate and click the "Generate PDFs" button. The PDFs will be generated and automatically downloaded as a zip file.

## Limitations

Generating a large number of PDFs can be resource-intensive and may take longer.
- 1000 PDFs took ~13 seconds | ZIP file size: 54.9 MB
- 5000 PDFs took ~1 minute after 2 "This page isn't responding" popups | ZIP file size: 274 MB | (why do you need this many)
  
## Next Steps
- Nicer PDF formatting
- more advanced equations (user is able to select for different grade levels)
- Custom equations (user inputs format, numbers are randomized)
- Custom number of equations per PDF
  
  
