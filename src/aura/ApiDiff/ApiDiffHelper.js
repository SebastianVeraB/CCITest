({
    showToast : function(component,title, message, variant)
    {
        component.find('notifLib').showToast({
            "title": title,
            "message": message,
            "variant" : variant
        });

    },

    showNotice : function(component, variant, header, message)
    {
        component.find('notifLib').showNotice({
            "variant": variant,
            "header": header,
            "message": message,
            closeCallback: function() {
                alert('You closed the alert!');
            }
        });
    },

    checkFiles : function(component, event)
    {
        console.log('Test 1');

        var aRoot = component.get("v.Root");
        var aMirror = component.get("v.Mirror");

        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(aRoot,"text/xml");
        var fields = xmlDoc.getElementsByTagName("fields");
        var alerts = xmlDoc.getElementsByTagName("alerts");

        var returnMap = this.parseFields(fields);
        var rootFieldsMap = returnMap.get('FieldsMap');
        var rootPicklistMap = returnMap.get('PicklistMap');
        returnMap.clear();

        var rootAlertsMap = this.parseAlerts(alerts);

        component.set("v.rootFieldsMap", rootFieldsMap);
        component.set("v.rootPicklistMap", rootPicklistMap);

        xmlDoc = parser.parseFromString(aMirror,"text/xml");
        fields = xmlDoc.getElementsByTagName("fields");
        alerts = xmlDoc.getElementsByTagName("alerts");



        returnMap = this.parseFields(fields);
        var mirrorFieldsMap = returnMap.get('FieldsMap');
        var mirrorPicklistMap = returnMap.get('PicklistMap');
        returnMap.clear();

        var mirrorAlertsMap = this.parseAlerts(alerts);


        this.findLabelsWithDifferentApiName(component, mirrorFieldsMap, rootFieldsMap);
        this.findPicklistLabelsWithDifferentApiName(component, mirrorPicklistMap, rootPicklistMap);
        this.findAlertsWithDifferentTemplates(component, mirrorAlertsMap, rootAlertsMap);

        component.set("v.showResult", true);

    },
    parseAlerts : function(alerts)
    {
        var returnMap = new Map();
        for(var i =0; i < alerts.length; i++)
        {
            var childNodes = alerts[i].childNodes;
            if(alerts[i].children.length > 0)
            {
                var fullName = this.getTagValue(childNodes, 'fullName');
                var template = this.getTagValue(childNodes, 'template');
            returnMap.set(fullName,template);
            }
        }
        return returnMap;
    },

    parseFields : function (fields)
    {
        var fieldsMap = new Map();
        var picklistMap = new Map();
        var returnMap = new Map();

        for(var i =0; i < fields.length; i++)
        {
            var childNodes = fields[i].childNodes;
            if(fields[i].children.length > 0)
            {
                var fullName = this.getTagValue(childNodes, 'fullName');
                var label = this.getTagValue(childNodes, 'label');
                if(!fieldsMap.set(label, fullName))
                {
                    fieldsMap.set(label + ' ', fullName)
                }
                if(this.getTagValue(childNodes, 'type') === 'Picklist')
                {
                    picklistMap.set(fullName, this.getPicklist(childNodes));
                }
            }

        }
        returnMap.set('FieldsMap', fieldsMap);
        returnMap.set('PicklistMap', picklistMap);

        return returnMap;
    },

    findLabelsWithDifferentApiName : function (component, mirrorFieldsMap,rootFieldsMap)
    {
        var apiDifferences = [];


        mirrorFieldsMap.forEach(function(mirrorValue, key, map){
          	if(rootFieldsMap.has(key))
            {
                var rootValue = rootFieldsMap.get(key);
                if(mirrorValue !== rootValue)
                {
                    apiDifferences.push({mirrorValue : mirrorValue, rootValue : rootValue});
                }

            }
        });

       component.set("v.fieldsApiDifferences", apiDifferences);


    },

    findPicklistLabelsWithDifferentApiName : function (component, mirrorPicklistMap,rootPicklistMap)
    {
        var picklistFieldsAndDiferences = [];

               
        mirrorPicklistMap.forEach(function(mirrorValue, key, map){
          	if(rootPicklistMap.has(key))
            {
                var apiDifferences = [];
                var mirrorPicklist = mirrorPicklistMap.get(key);
                mirrorPicklist.forEach(function(mirrorApiName,mirrorLabel, map ){
                    var rootValue = rootPicklistMap.get(key).get(mirrorLabel);
                    if(mirrorApiName !== rootValue)
                    {
                        apiDifferences.push({mirrorValue : mirrorApiName, rootValue : rootValue});
                    }

                });
                if(apiDifferences.length >0)
                {
                    picklistFieldsAndDiferences.push({fieldsName: key, picklist: apiDifferences});
                }

            }
        });


       component.set("v.picklistApiDifferences", picklistFieldsAndDiferences);


    },
    findAlertsWithDifferentTemplates : function (component, mirrorAlertsMap, rootAlertsMap)
    {
        var apiDifferences = [];


        mirrorAlertsMap.forEach(function(mirrorTemplate, mirrorApi, map){
          	if(rootAlertsMap.has(mirrorApi))
            {

                var rootTemplate = rootAlertsMap.get(mirrorApi);

                if(rootTemplate !== mirrorTemplate)
                {
                    apiDifferences.push({alertApi : mirrorApi, mirrorValue : mirrorTemplate, rootValue : rootTemplate});
                }

            }
        });

        component.set("v.alertsTemplateDifferences", apiDifferences);
        console.log(apiDifferences);
    },

    getTagValue : function (nodes, tag)
    {
        for(var i =0; i < nodes.length; i++)
        {
            if(nodes[i].nodeName === tag) return nodes[i].textContent;
        }
    },

    getNode : function (nodes, aNodeName)
    {
        var nodesFound = [];
        nodes.forEach(function(node) {
                if(node.nodeName === aNodeName)
                {
                    nodesFound.push(node);
                }
          })
          return nodesFound;
    },

    getPicklist : function (nodes)
    {
        var valuesMap = new Map();

        var valueSet = this.getNode(nodes, 'valueSet');
        var valueSetDefinition = this.getNode(valueSet[0].childNodes, 'valueSetDefinition');
        var values = this.getNode(valueSetDefinition[0].childNodes, 'value');

        for(var i = 0; i < values.length; i++)
        {
            
           if(!valuesMap.set(this.getTagValue(values[i].childNodes, 'label'), this.getTagValue(values[i].childNodes, 'fullName')))
           {
              valuesMap.set(this.getTagValue(values[i].childNodes, 'label') + ' ', this.getTagValue(values[i].childNodes, 'fullName'));
            
           }
        }
            return valuesMap;
    },

    logErrors : function (errors)
    {
        if (errors) {
            if (errors[0] && errors[0].message) {
                console.log("Error message: " + 
                         errors[0].message);
            }
        } else {
            console.log("Unknown error");
        }
    },

  

    

})