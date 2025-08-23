import RebuildThumbnail from "../editors/RebuildThumbnail";
import RebuildSearch from "../pages/RebuildSearch";

export default function AdminOps() {
    return <>
        <section>
            <RebuildSearch />
        </section>
        <section className="mt-4">
            <RebuildThumbnail />
        </section>
    </>;
}