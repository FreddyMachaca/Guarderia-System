class RequestManager {
    constructor() {
        this.activeRequests = new Map();
        this.requestQueue = new Map();
        this.maxConcurrentRequests = 3;
        this.debounceTime = 300;
    }

    async makeRequest(key, requestFn, priority = 1) {
        this.cancelRequest(key);
        
        return new Promise((resolve, reject) => {
            const controller = new AbortController();
            const request = {
                key,
                requestFn,
                resolve,
                reject,
                controller,
                priority,
                timestamp: Date.now()
            };

            this.requestQueue.set(key, request);
            this.processQueue();
        });
    }

    cancelRequest(key) {
        const activeRequest = this.activeRequests.get(key);
        if (activeRequest) {
            activeRequest.controller.abort();
            this.activeRequests.delete(key);
        }

        const queuedRequest = this.requestQueue.get(key);
        if (queuedRequest) {
            this.requestQueue.delete(key);
        }
    }

    cancelAllRequests() {
        this.activeRequests.forEach(request => {
            request.controller.abort();
        });
        this.activeRequests.clear();
        this.requestQueue.clear();
    }

    async processQueue() {
        if (this.activeRequests.size >= this.maxConcurrentRequests) {
            return;
        }

        const sortedRequests = Array.from(this.requestQueue.values())
            .sort((a, b) => b.priority - a.priority || a.timestamp - b.timestamp);

        const nextRequest = sortedRequests[0];
        if (!nextRequest) return;

        this.requestQueue.delete(nextRequest.key);
        this.activeRequests.set(nextRequest.key, nextRequest);

        try {
            const result = await nextRequest.requestFn(nextRequest.controller.signal);
            this.activeRequests.delete(nextRequest.key);
            nextRequest.resolve(result);
        } catch (error) {
            this.activeRequests.delete(nextRequest.key);
            if (error.name !== 'AbortError') {
                nextRequest.reject(error);
            }
        }

        setTimeout(() => this.processQueue(), 10);
    }

    debounce(func, delay = this.debounceTime) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
}

export default new RequestManager();
