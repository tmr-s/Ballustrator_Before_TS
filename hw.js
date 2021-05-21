
const a = "x('SEX!!!');";
const b = new Function(...["x", a]);
b((e) => {
    alert(e);
});

const xt = function(t, z1, z2, z3, z4) {
    const zt1 = (z4 - 3*(z3 - z2) - z1)*t*t*t + 3*(z3 - 2*z2 + z1)*t*t + 3*(z2-z1)*t + z1;
    const zt2 = 3*(t*t*(z4-z3)+2*t*(1-t)*(z3-z2)+(1-t)*(1-t)*(z2-z1));
    return [zt1, zt2];
}
const A = document.getElementById("A");
A.addEventListener("input", (e) => {
    const B = document.getElementById("B");
    const data = new FormData(B);
    console.log(data);
    fetch("https://g93iy3t0j9.execute-api.us-east-2.amazonaws.com/beta/files/upload?place=TX000000&name=sample", {
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": "eyJraWQiOiJWdHFKdGNXRXo2XC9USUU5QkRRS0V6dmhDWGNXK09kY0dJaDZ6UnJVWmJUOD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2N2E1NWU1OS1iMzlmLTQ0MTUtODlhZC1hOTM5NjFmMGExZDUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMi5hbWF6b25hd3MuY29tXC91cy1lYXN0LTJfc3hLeE5EYVQ3IiwiY29nbml0bzp1c2VybmFtZSI6InRtci1zQGcuZWNjLnUtdG9reW8uYWMuanAiLCJnaXZlbl9uYW1lIjoiU2h1bXBlaSIsImF1ZCI6IjN1NzhydWc0MzIwNXNpdmNhY203cjBicWV1IiwiZXZlbnRfaWQiOiI3ZjFjYzJjMi0zNDljLTQxY2YtOGU0Yi1lODU4OGQwMTNkMDIiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTYyMDUzODAxMCwiZXhwIjoxNjIwODAwNDg5LCJpYXQiOjE2MjA3OTY4ODksImZhbWlseV9uYW1lIjoiVHN1bXVyYSIsImVtYWlsIjoidG1yLXNAZy5lY2MudS10b2t5by5hYy5qcCJ9.A3EM1Nm8vh1n2ooaZxIPqNkM_aP3OgBRuznSMuZbOKwFATHKC1CsPmLFgFLWQaZ3w24Dn5eDMh5nUNv8z_KeTSEZJ9TleZCo6hocJ2SviQqeLavsuyiAmvqA4oGqsGJHcQdYU02Cps9UyKH1iEA58Y1zLexU4FiFzCo2-FJ5dQFXceAkWA_sdFS5FCa5K95BdgfvDb35xo26Yt469w3-crK13ALPWBt6VcMES0Wt-QzfrJe_aO3Gz5xuysED5rd_hyiW9B9qqDleBE6QpCLR3Bm2Flz_zUh2kpzpMYCx8gCOy9n-cEIfA6sk9ZIQhh4AQuLI8NcSHlspoZwfZs1ahQ"
        },
        body: data
    }).then(res => {
        res.json();
    }).then(ans => {
        console.log(ans);
    }).catch(err => {
        console.log(err);
    });
});

const canvas = document.getElementById('XXX');
if(canvas) {
    const ctx = canvas.getContext('2d');
    if(ctx) {
        ctx.strokeStyle = "black";
        /*
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(0, 400, 600, 0, 600, 400);
        ctx.stroke();//*/
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.strokeStyle = "red";
        let len = 0;
        let point = [0, 0];
        for(let i=1;i<100;i++) {
            const t = i/100;
            const xs = xt(t, 0, 0, 600, 600);
            const ys = xt(t, 0, 400, 0, 400);
            const nowx = xs[0] - point[0];
            const nowy = ys[0] - point[1];
            const now = Math.sqrt(nowx*nowx + nowy*nowy);
            if(now >= 10) {
                if(len == 0) {
                    ctx.lineTo(point[0] + nowx/2 - nowy*0.866, point[1] + nowy/2 + nowx*0.866);
                    ctx.lineTo(xs[0], ys[0]);
                    len = 1;
                }else {
                    ctx.lineTo(point[0] + nowx/2 + nowy*0.866, point[1] + nowy/2 - nowx*0.866);
                    ctx.lineTo(xs[0], ys[0]);
                    len = 0;
                }
                ctx.lineTo(xs[0], ys[0]);
                point = [xs[0], ys[0]];
            }
        }
        ctx.stroke();
    }
}