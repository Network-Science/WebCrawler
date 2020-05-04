//I'm not sure, but I believe we can delete this.
onmessage = function(e) {
    importScripts('crawler.js');
    let doc = e.data;
    
    //let links = JSONSearchForLinks(doc);
        
        
    this.postMessage(doc)
    
}