document.getElementById('fileInput').addEventListener('change', function () {
  for (let i = 0; i < this.files.length; i++) {
    const file = this.files[i];
    console.log(`Выбран файл ${i + 1}:`, file.name);
  }
})
document.getElementById('mergeButton').addEventListener('click', function () {
  const files = document.getElementById('fileInput').files;
  if (document.getElementById('fileNameInput')) document.getElementById('fileNameInput').remove();
  if (document.getElementById('exportToExcel')) document.getElementById('exportToExcel').remove();

  if (files.length === 0) {
    alert('Файлы не выбраны');
    return;
  }

  let mergedSheet = [];
  let headers = [];

  Promise.all(
    Array.from(files).map(file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const readOptions = file.type === "text/csv" ? { type: 'array', raw: true } : { type: 'array', cellDates: true }
        const workbook = XLSX.read(data, readOptions);
        resolve(workbook);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    }))
  ).then(workbooks => {
    workbooks.forEach((workbook, index) => {
      const sheetName = workbook.SheetNames[0];
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

      if (index === 0) {
        headers = sheet[0];
      }

      sheet.slice(1).forEach(row => {
        mergedSheet.push(row)
      });
    });

    const resultDiv = document.getElementById('result');
    let innerHTML = '<table id="mergedTable" border="1"><tr>' + '<td>' + headers.join('</td><td>') + '</td>' + '</tr>';

    mergedSheet.forEach(row => {
      innerHTML += '<tr>' + '<td>' + row.join('</td><td>') + '</td>' + '</tr>';
    });

    innerHTML += '</table>';
    resultDiv.innerHTML = innerHTML

    let input = document.createElement('input');
    input.type = 'text';
    input.id = 'fileNameInput';
    input.placeholder = 'Имя файла';
    document.getElementById('buttons').appendChild(input);

    let exportButton = document.createElement("button");
    exportButton.id = 'exportToExcel';
    exportButton.textContent = "Экспорт в XLSX";
    exportButton.onclick = exportToExcel;
    document.getElementById('buttons').appendChild(exportButton);
  });
})

function exportToExcel() {
  let table = document.getElementById('mergedTable');

  let workbook = XLSX.utils.book_new();

  let worksheet = XLSX.utils.table_to_sheet(table, { raw: true });
  XLSX.utils.book_append_sheet(workbook, worksheet, "Лист1");

  let buffer = XLSX.write(workbook, { type: 'array' });
  let blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
  let link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  let fileName = document.getElementById('fileNameInput').value
  if (fileName.length === 0) fileName = `merged_${(new Date()).toLocaleDateString("ru-RU")}`

  link.download = `${fileName}.xlsx`;

  link.click();
}
