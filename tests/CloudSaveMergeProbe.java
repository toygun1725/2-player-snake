import com.twoplayersnake.app.cloud.CloudSaveData;
import com.twoplayersnake.app.cloud.CloudScore;
import java.util.List;
import java.util.Set;
import java.util.stream.IntStream;

public class CloudSaveMergeProbe {
    public static void main(String[] args) {
        CloudSaveData first = new CloudSaveData(List.of(new CloudScore("Z", 12), new CloudScore("😀", 12)), List.of(new CloudScore("PC", 4)), Set.of("ACH_FIRST_FOOD"), false);
        CloudSaveData second = new CloudSaveData(List.of(new CloudScore("A", 12), new CloudScore("Z", 12), new CloudScore("Best", 13)), List.of(), Set.of("ACH_AI_HUNTER"), true);
        CloudSaveData merged = CloudSaveData.Companion.merge(first, second);
        if (!merged.getMobileScores().stream().map(CloudScore::getName).toList().equals(List.of("Best", "A", "Z", "😀"))) throw new AssertionError("wrong score ordering or deduplication");
        if (merged.getPcScores().size() != 1 || merged.getAchievements().size() != 2 || !merged.getAdsRemoved()) throw new AssertionError("missing merged data");
        CloudSaveData many = new CloudSaveData(IntStream.range(0, 20).mapToObj(i -> new CloudScore("N" + i, i)).toList(), List.of(), Set.of(), false);
        CloudSaveData limited = CloudSaveData.Companion.merge(many);
        if (limited.getMobileScores().size() != 10 || limited.getMobileScores().get(0).getScore() != 19 || limited.getMobileScores().get(9).getScore() != 10) throw new AssertionError("top ten not preserved");
        System.out.println("CloudSaveData merge: OK");
    }
}
