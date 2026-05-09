class Node{
    constructor(url){
        this.url = url;
        this.next = null;
        this.prev = null;
    }
};

class BroswerHistory{
    constructor(){
        this.current = null;

    }

    visit(url){
        const newnode = new Node(url);
        if(this.current){
            newnode.prev = this.current;
            this.current.next = newnode;
        }
        this.current = newnode;
    }

    goback(){
        if(this.current && this.current.prev){
            this.current = this.current.prev;
            return this.current.url;
        }
        return "No previous page was found";
    }

    goforward(){
        if(this.current && this.current.next){
            this.current = this.current.next;
            return this.current.url;
        }
        return "No forward page was found"
    }

    deletepage(url){

        if(!this.current) return;

        
        const tempnode = this.current;



        if(this.current.prev == null && this.current.next != null){
            this.current.next.prev = null;
            this.current = this.current.next;
            tempnode.next = null;
        }

        if(this.current.prev != null && this.current.next == null){
            this.current.prev.next = null;
            tempnode.prev = null;
            this.current = this.current.prev;
        }

        if(this.current.prev != null && this.current.next != null){
            this.current.prev.next  = tempnode.next;
            this.current.next.prev = tempnode.prev;
            this.current = tempnode.prev;
            tempnode.next = null;
            tempnode.prev = null;
        }

        if(this.current.prev == null && this.current.next == null){
            this.current = null;
        }

    }

    getcurrentpage(){
        return this.current ? this.current.url : "No page visited"
    }
};

module.exports = BroswerHistory;