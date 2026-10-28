import com.twoplayersnake.app.cloud.*;
import java.util.*;
import kotlin.Unit;
import kotlin.jvm.functions.Function1;

public class CloudSnapshotResolverProbe {
    static CloudSaveData save(String name) { return new CloudSaveData(List.of(new CloudScore(name, 10)), List.of(), Set.of(), false); }
    static class Backend implements CloudSnapshotBackend<String> {
        int calls, commits; boolean alwaysConflict, failDiscard, deferResolution;
        final List<String> discarded=new ArrayList<>(), resolved=new ArrayList<>();
        CloudSaveData committed;
        CloudSaveData pendingData;
        Function1<? super CloudSnapshotResult<String>, Unit> pendingCallback;
        @Override public void discard(String h, Function1<? super Boolean, Unit> done) { discarded.add(h); done.invoke(!failDiscard); }
        @Override public void resolve(String id, String h, CloudSaveData merged, boolean legacy, Function1<? super CloudSnapshotResult<String>, Unit> done) {
            calls++; resolved.add(h);
            if (deferResolution) { pendingData=merged; pendingCallback=done; }
            else if (alwaysConflict) done.invoke(new CloudSnapshotResult.Conflict<>("c"+calls, "chosen"+calls, merged, "other"+calls, save("other"+calls)));
            else done.invoke(new CloudSnapshotResult.Opened<>("resolved", merged));
        }
        @Override public void commit(String h, CloudSaveData merged, Function1<? super Boolean, Unit> done) {commits++;committed=merged;done.invoke(true);}
    }
    public static void main(String[] args) {
        Backend ok=new Backend(); CloudSaveData[] result={null};
        new CloudSnapshotResolver<String>(ok).run(new CloudSnapshotResult.Conflict<>("c", "first",save("first"),"second",save("second")),false,save("new"),v->{result[0]=v;return Unit.INSTANCE;});
        if(ok.calls!=1||ok.commits!=1||!ok.discarded.equals(List.of("second"))||result[0].getMobileScores().size()!=3)throw new AssertionError("conflict merge/write failed");
        Backend limit=new Backend();limit.alwaysConflict=true;CloudSaveData[] failed={save("sentinel")};
        new CloudSnapshotResolver<String>(limit).run(new CloudSnapshotResult.Conflict<>("c", "first",save("first"),"second",save("second")),true,null,v->{failed[0]=v;return Unit.INSTANCE;});
        if(limit.calls!=3||failed[0]!=null||limit.commits!=0||!limit.discarded.contains("chosen3")||!limit.discarded.contains("other3"))throw new AssertionError("conflict retry limit failed");
        for(String h:limit.resolved)if(limit.discarded.contains(h))throw new AssertionError("resolved handle discarded twice");
        Backend bad=new Backend();bad.failDiscard=true;CloudSaveData[] error={save("sentinel")};
        new CloudSnapshotResolver<String>(bad).run(new CloudSnapshotResult.Conflict<>("c", "first",save("first"),"second",save("second")),false,null,v->{error[0]=v;return Unit.INSTANCE;});
        if(error[0]!=null||bad.calls!=0)throw new AssertionError("discard error not propagated");
        Backend delayed=new Backend();delayed.deferResolution=true;int[] callbacks={0};
        new CloudSnapshotResolver<String>(delayed).run(new CloudSnapshotResult.Conflict<>("c", "first",save("first"),"second",save("second")),true,null,v->{callbacks[0]++;return Unit.INSTANCE;});
        if(callbacks[0]!=0)throw new AssertionError("load completed before conflict resolved");
        delayed.pendingCallback.invoke(new CloudSnapshotResult.Opened<>("resolved", delayed.pendingData));
        if(callbacks[0]!=1||delayed.commits!=0||!delayed.discarded.contains("resolved"))throw new AssertionError("resolved load was not safely closed");
        System.out.println("CloudSnapshotResolver: OK");
    }
}
