declare module "bittorrent-tracker" {
    export class Peer {
        type: string;
        complete: number;
        peerId: string;
        ip: string;
        port: number;
        socket: any;
    }

    export class Swarm {
        infoHash: string;
        complete: number;
        incomplete: number;
        peers: Map<string, Peer>;

        announce(params: object, callback?: function): void;
        scrape(params: object, callback?: function): void;
    }

    export class ServerOptions {
        interval: number;
        trustProxy: number;
        http: boolean | object;
        udp: boolean | object;
        ws: boolean | object;
        stats: boolean;
        filter: function;
    }

    export class Server {
        on(event: "error" | "warning", callback: (e: Error) => void);
        on(event: "listening", callback: () => void);
        on(event: "start" | "complete" | "update" | "stop", callback: (addr: string) => void);

        http: any;
        udp4: any;
        udp6: any;
        udp: any;
        ws: any;
        torrents: Map<string, Swarm>;
        constructor(options?: ServerOptions);

        listen(port: number, hostname?: string, callback?: function): void;
        close(callback?: function): void;
        createSwarm(infoHash: string, callback?: function): void;
        getSwarm(infoHash: string, callback?: function): void;
    }
}
