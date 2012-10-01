$ ->
  handleFileSelect = (evt) ->
    files = evt.target.files # FileList object
    
    # files is a FileList of File objects. List some properties.
    output = []
    i = 0
    f = undefined

    while f = files[i]
      output.push "<li><strong>", escape(f.name), "</strong> (", f.type or "n/a", ") - </li>"
      #output.push "<li><strong>", escape(f.name), "</strong> (", f.type or "n/a", ") - ", f.size, " bytes, last modified: ", f.lastModifiedDate.toLocaleDateString(), "</li>"
      i++
    document.getElementById("list").innerHTML = "<ul>" + output.join("") + "</ul>"

  document.getElementById("INmusica").addEventListener "change", handleFileSelect, false
