({
  handleFilesChangeRoot : function (component, event, helper) 
    {



      component.set("v.isLoading", false);

      
      var greenCircle = 'slds-welcome-mat__tile_complete';
      console.log(event.target.files[0]);
        var files = event.target.files;
        var reader = new FileReader();

        reader.onload = function(e) {
          var fileContent = reader.result;
          component.set("v.Root", fileContent);

          component.set("v.isLoading", false); 
          var icon =   component.find("rootIcon");
          icon.set("v.iconName", "doctype:attachment");
          var tile = component.find("tileroot");
          $A.util.addClass(tile, greenCircle);
          helper.showToast(component, "File loaded!", "", "success");
        }
        reader.readAsText(files[0]); 
        component.set("v.rootName", files[0].name);
        
    },

    handleFilesChangeMirror : function (component, event, helper) 
    {
      component.set("v.isLoading", true);
      var greenCircle = 'slds-welcome-mat__tile_complete';
        var files = event.target.files;
        var reader = new FileReader();

        reader.onload = function(e) {
          var fileContent = reader.result;
          component.set("v.Mirror", fileContent);
          
          component.set("v.isLoading", false); 
          var icon = component.find("mirrorIcon");
          icon.set("v.iconName", "doctype:attachment");
          var tile = component.find("tilemirror");
          $A.util.addClass(tile, greenCircle);
          helper.showToast(component, "File loaded!", "", "success");
        }
        reader.readAsText(files[0]); 
        
    },

    handleCheck : function (component, event, helper)
    {
      
        helper.checkFiles(component, event);
    },
    mouseDown : function(component, event)
    {
        var element = event.currentTarget;
        $A.util.removeClass(element, 'shadow');
    },
    mouseUp : function(component, event)
    {
      
        var element = event.currentTarget;
        $A.util.addClass(element, 'shadow');
    }
   
   
})