export default function getRefreshMargin() {
    let refresh = Number(Deno.env.get("REFRESH_MARGIN"));
    if (Number.isNaN(refresh)) {
        refresh = 180;
    }
    return refresh;
}