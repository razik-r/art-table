import { useEffect, useRef, useState } from "react";
import type { Artwork, ArtworkTable } from "./services/data/ArtworkTable";
// import './App.css'

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Skeleton } from "primereact/skeleton";

import { TableData } from "./services/api/TableData";

import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";

function App() {
  const [artwork, setArtwork] = useState<Artwork[]>([]);
  const [totalWorks, setTotalWorks] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);

  const [selectedRows, setSelectedRows] = useState<Artwork[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const fetchArtworks = async (page: number) => {
    setLoading(true);
    const res = await TableData.getArtworks(page);
    setArtwork(res.data);
    setTotalWorks(res.pagination.total);

    // const pageSelection = res.data.filter((row) =>
    //   selectedIds.has(row.id)
    // );
    // setSelectedRows(pageSelection);

    setLoading(false);
  };

  useEffect(() => {
    fetchArtworks(0);
  }, []);

  useEffect(() => {
    // Restore selected rows based on selectedIds whenever artwork changes
    const restoredRows = artwork.filter((row) => selectedIds.has(row.id));
    setSelectedRows(restoredRows);
  }, [artwork, selectedIds]);

  const skeleton = () => <Skeleton width="100%" height="1.5rem" />;

  //let start with overlay panel

  //1 .  create a reference for overlay panel
  const overlayRef = useRef<OverlayPanel>(null);
  const [value, setValue] = useState(12);

  const applyCustomSelection = () => {
    const count = Math.min(value, artwork.length);
    const selected = artwork.slice(0, count);

    setSelectedRows(selected);

    setSelectedIds((prev) => {
      const next = new Set(prev);

      // clear current page contribution
      artwork.forEach((row) => next.delete(row.id));

      // add newly selected rows
      selected.forEach((row) => next.add(row.id));

      return next;
    });

    overlayRef.current?.hide();
  };

  //end of overlay panel

  return (
    <>
      <div className="App">
        <OverlayPanel ref={overlayRef}>
          <div
            style={{
              maxHeight: "100px",
              width: "fit-content",
              height: "fit-content",
            }}
          >
            <label>Select Multiple Rows</label>
            <p>Enter Number Of Rows to Select across all pages</p>

            <InputNumber
              value={value}
              onValueChange={(e) => setValue(e.value ?? 0)}
              min={0}
              style={{ width: "calc(100%-vh)" }}
            />

            <Button
              label="Apply"
              className="p-button-sm"
              style={{ marginTop: "0.75rem" }}
              onClick={applyCustomSelection}
            />
          </div>
        </OverlayPanel>

        <div style={{ color: "slategray" }}>
          Selected :{" "}
          <span style={{ color: "blue", fontWeight: "bold" }}>
            {" "}
            {selectedRows.length}
          </span>{" "}
          Rows
        </div>

        <DataTable
          stripedRows
          value={artwork}
          paginator
          rows={12}
          lazy
          first={page * 12}
          totalRecords={totalWorks}
          loading={loading}
          dataKey="id"
          onPage={(e) => {
            setPage(e.page!);
            fetchArtworks(e.page! + 1);
          }}
          selectionMode="multiple"
          selection={selectedRows}
          onSelectionChange={(e) => {
            //first we get the selected rows from event
            const selected = Array.isArray(e.value)
              ? e.value
              : e.value
              ? [e.value]
              : [];
            setSelectedRows(selected); // update the selectedRows state

            // Now we update the selectedIds set accordingly
            setSelectedIds((prev) => {
              const next = new Set(prev);
              artwork.forEach((row) => next.delete(row.id));
              selected.forEach((row) => next.add(row.id));
              return next;
            });

            console.log("Selected Rows: ", selected);
          }}
        >
          <Column
            selectionMode="multiple"
            header={
              <Button
                icon="pi pi-angle-down"
                size="small"
                text
                rounded
                onClick={(e) => overlayRef.current?.toggle(e)}
                style={{
                  position: "absolute",
                  right: "-10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "1.25rem",
                  height: "1.25rem",
                  padding: "0",
                }}
              />
            }
            headerStyle={{
              width: "3.5rem",
              position: "relative", // 👈 anchor
            }}
          />
          <Column
            field="title"
            style={{ fontWeight: "bold" }}
            header="TITLE"
            // body={!loading ? undefined : skeleton}
          >
            {" "}
          </Column>
          <Column
            field="place_of_origin"
            header="PLACE OF ORIGIN"
            // body={!loading ? undefined : skeleton}
          ></Column>
          <Column
            field="artist_display"
            header="ARTIST"
            body={
              !loading
                ? (rowData) => (
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "block",
                        maxWidth: "200px",
                      }}
                    >
                      {rowData.artist_display}
                    </span>
                  )
                : skeleton
            }
          ></Column>
          <Column
            field="inscriptions"
            header="INSCRIPTION"
            // body={!loading ? undefined : skeleton}
          ></Column>
          <Column
            field="date_start"
            header="START DATE"
            // body={!loading ? undefined : skeleton}
          ></Column>

          <Column
            field="date_end"
            header="END DATE"
            // body={!loading ? undefined : skeleton}
          ></Column>
        </DataTable>
      </div>
    </>
  );
}

export default App;
