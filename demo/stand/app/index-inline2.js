
document.getElementById("bk-save").addEventListener("click",function(){window.tabelBackup().catch(function(e){if(!(e&&e.code==="declined")){var t=document.createElement("div");t.className="toast";t.textContent="Не удалось сохранить копию";document.body.appendChild(t);setTimeout(function(){t.remove()},2500)}})});
document.getElementById("bk-load").addEventListener("click",function(){document.getElementById("bk-file").click()});
document.getElementById("bk-file").addEventListener("change",function(ev){var f=ev.target.files[0];ev.target.value="";if(!f)return;
  window.tabelRestore(f).then(function(){location.reload()},function(){var t=document.createElement("div");t.className="toast";t.textContent="Этот файл не похож на копию Табеля";document.body.appendChild(t);setTimeout(function(){t.remove()},2500)})});
